package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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
			processedFiles = append(processedFiles, folderFiles...)
		} else {
			if info.Size() <= 500*1024 {
				processedFiles = append(processedFiles, fullPath)
			}
		}
	}
	return processedFiles, nil
}

func (a *App) ProcessFolder(folderPath string, config map[string]interface{}) ([]string, error) {
	var files []string
	var err error

	recursive, _ := config["recursive"].(bool)
	ignoreSuffixes, _ := config["ignoreSuffixes"].(string)
	ignoreFolders, _ := config["ignoreFolders"].(string)

	ignoreSuffixList := strings.Split(ignoreSuffixes, ",")
	ignoreFolderList := strings.Split(ignoreFolders, ",")

	err = filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			if !recursive && path != folderPath {
				return filepath.SkipDir
			}
			for _, ignoreFolder := range ignoreFolderList {
				if strings.HasSuffix(path, ignoreFolder) {
					return filepath.SkipDir
				}
			}
			return nil
		}

		for _, ignoreSuffix := range ignoreSuffixList {
			if strings.HasSuffix(path, ignoreSuffix) {
				return nil
			}
		}

		if info.Size() > 500*1024 {
			return nil
		}

		files = append(files, path)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("error processing folder: %v", err)
	}

	return files, nil
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

// func (a *App) getCurrentDirectory() string {
// 	dir, err := os.Getwd()
// 	if err != nil {
// 		return fmt.Sprintf("Error getting current directory: %v", err)
// 	}
// 	return dir
// }

// func (a *App) HandleFileDrop(files []string) error {
// 	runtime.LogDebug(a.ctx, fmt.Sprintf("Handling file drop for files: %v", files))
// 	runtime.LogDebug(a.ctx, fmt.Sprintf("Current working directory: %s", a.getCurrentDirectory()))

// 	processedFiles, err := a.processDroppedFiles(files)
// 	if err != nil {
// 		runtime.LogError(a.ctx, fmt.Sprintf("Error handling file drop: %v", err))
// 		return err
// 	}

// 	runtime.LogDebug(a.ctx, fmt.Sprintf("Processed files: %v", processedFiles))
// 	runtime.EventsEmit(a.ctx, "files-dropped", processedFiles)
// 	return nil
// }

// func (a *App) processDroppedFiles(files []string) ([]string, error) {
// 	var processedFiles []string
// 	for _, file := range files {
// 		info, err := os.Stat(file)
// 		if err != nil {
// 			runtime.LogWarning(a.ctx, fmt.Sprintf("Error getting file info for %s: %v", file, err))
// 			continue
// 		}

// 		if info.IsDir() {
// 			err := filepath.Walk(file, func(path string, info os.FileInfo, err error) error {
// 				if err != nil {
// 					return err
// 				}
// 				if !info.IsDir() && info.Size() <= 500*1024 {
// 					processedFiles = append(processedFiles, path)
// 				}
// 				return nil
// 			})
// 			if err != nil {
// 				runtime.LogWarning(a.ctx, fmt.Sprintf("Error processing folder %s: %v", file, err))
// 			}
// 		} else if info.Size() <= 500*1024 {
// 			processedFiles = append(processedFiles, file)
// 		}
// 	}
// 	return processedFiles, nil
// }
