package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// HandleFileDrop processes dropped files and folders
func (a *App) HandleFileDrop(files []string) error {
	runtime.LogDebug(a.ctx, fmt.Sprintf("Handling file drop for files: %v", files))
	runtime.LogDebug(a.ctx, fmt.Sprintf("Current working directory: %s", a.getCurrentDirectory()))

	processedFiles, err := a.processDroppedFiles(files)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Error handling file drop: %v", err))
		return err
	}

	runtime.LogDebug(a.ctx, fmt.Sprintf("Processed files: %v", processedFiles))
	runtime.EventsEmit(a.ctx, "files-dropped", processedFiles)
	return nil
}

func (a *App) processDroppedFiles(files []string) ([]string, error) {
	var processedFiles []string
	for _, file := range files {
		fullPath, err := a.findFile(file)
		if err != nil {
			runtime.LogWarning(a.ctx, fmt.Sprintf("Skipping file %s: %v", file, err))
			continue
		}

		// Check if file is already in the list
		if contains(processedFiles, fullPath) {
			continue
		}

		info, err := os.Stat(fullPath)
		if err != nil {
			runtime.LogWarning(a.ctx, fmt.Sprintf("Error getting file info for %s: %v", fullPath, err))
			continue
		}

		if info.IsDir() {
			folderFiles, err := a.ProcessFolder(fullPath, map[string]interface{}{
				"recursive":      true,
				"ignoreSuffixes": ".env,.log,.json,.gitignore,.npmrc,.prettierrc",
				"ignoreFolders":  ".git,.vscode,.idea,node_modules,venv,build,dist,coverage,out,next",
			})
			if err != nil {
				runtime.LogWarning(a.ctx, fmt.Sprintf("Error processing folder %s: %v", fullPath, err))
				continue
			}
			for _, f := range folderFiles {
				if !contains(processedFiles, f) {
					processedFiles = append(processedFiles, f)
				}
			}
		} else {
			if info.Size() <= 500*1024 {
				processedFiles = append(processedFiles, fullPath)
			}
		}
	}
	return processedFiles, nil
}

func (a *App) findFile(fileName string) (string, error) {
	// Check if it's already an absolute path
	if filepath.IsAbs(fileName) {
		if _, err := os.Stat(fileName); err == nil {
			return fileName, nil
		}
	}

	// Get the executable's directory
	execDir, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("error getting executable directory: %v", err)
	}
	execDir = filepath.Dir(execDir)

	// List of potential base directories
	potentialDirs := []string{
		".",                                      // Current working directory
		"..",                                     // Parent directory
		"frontend",                               // Frontend directory
		filepath.Join("..", "frontend"),          // Frontend directory from parent
		filepath.Join(execDir, "frontend"),       // Frontend directory from executable location
		filepath.Join(execDir, "..", "frontend"), // Frontend directory one level up from executable
	}

	for _, dir := range potentialDirs {
		fullPath := filepath.Join(dir, fileName)
		if _, err := os.Stat(fullPath); err == nil {
			absPath, err := filepath.Abs(fullPath)
			if err != nil {
				return "", err
			}
			return absPath, nil
		}
	}

	return "", fmt.Errorf("file not found: %s", fileName)
}

// contains checks if a string is present in a slice
func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}
	return false
}
