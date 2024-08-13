package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// domReady is called after the front-end dom has been loaded
func (a *App) domReady(ctx context.Context) {
	// Add startup tasks here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform cleanup tasks here
}

// SelectFile opens a file selection dialog and returns the selected file path
func (a *App) SelectFile() (string, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Files",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("error selecting file: %v", err)
	}
	return file, nil
}

// SelectDirectory opens a directory selection dialog and returns the selected directory path
func (a *App) SelectDirectory() (string, error) {
	directory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Folder",
	})
	if err != nil {
		return "", fmt.Errorf("error selecting directory: %v", err)
	}
	return directory, nil
}

// ProcessFolder processes the selected folder based on the provided configuration
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

		// Check if it's a directory
		if info.IsDir() {
			// If not recursive, skip subdirectories
			if !recursive && path != folderPath {
				return filepath.SkipDir
			}
			// Check if the directory should be ignored
			for _, ignoreFolder := range ignoreFolderList {
				if strings.HasSuffix(path, ignoreFolder) {
					return filepath.SkipDir
				}
			}
			return nil
		}

		// Check file suffix
		for _, ignoreSuffix := range ignoreSuffixList {
			if strings.HasSuffix(path, ignoreSuffix) {
				return nil
			}
		}

		// Check file size
		if info.Size() > 500*1024 { // 500KB
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

// ReadFileContent reads the content of a file
func (a *App) ReadFileContent(filePath string) (string, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading file content: %v", err)
	}
	return string(content), nil
}

// ReadSettingsFile reads the settings from the settings.json file
func (a *App) ReadSettingsFile() (string, error) {
	settingsPath := filepath.Join(a.getAppDataDir(), "settings.json")
	content, err := os.ReadFile(settingsPath)
	if err != nil {
		if os.IsNotExist(err) {
			// If the file doesn't exist, return an empty JSON object
			return "{}", nil
		}
		return "", fmt.Errorf("error reading settings file: %v", err)
	}
	return string(content), nil
}

// WriteSettingsFile writes the settings to the settings.json file
func (a *App) WriteSettingsFile(content string) error {
	settingsPath := filepath.Join(a.getAppDataDir(), "settings.json")
	err := os.MkdirAll(filepath.Dir(settingsPath), 0755) // Ensure directory exists
	if err != nil {
		return fmt.Errorf("error creating settings directory: %v", err)
	}
	err = os.WriteFile(settingsPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("error writing settings file: %v", err)
	}
	return nil
}

// getAppDataDir returns the path to the application data directory
func (a *App) getAppDataDir() string {
	// This is a simplified version. You might want to use a more robust method
	// to determine the appropriate directory for different operating systems.
	homeDir, err := os.UserHomeDir()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Error getting user home directory: %v", err))
		return ""
	}
	return filepath.Join(homeDir, ".code-prompter")
}

// HandleFileDrop processes dropped files and folders
func (a *App) HandleFileDrop(files []string) ([]string, error) {
	var processedFiles []string
	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			return nil, fmt.Errorf("error getting file info: %v", err)
		}

		if info.IsDir() {
			// Process folder
			folderFiles, err := a.ProcessFolder(file, map[string]interface{}{
				"recursive":      true,
				"ignoreSuffixes": ".env,.log,.json,.gitignore,.npmrc,.prettierrc",
				"ignoreFolders":  ".git,.vscode,.idea,node_modules,venv,build,dist,coverage,out,next",
			})
			if err != nil {
				return nil, fmt.Errorf("error processing folder: %v", err)
			}
			processedFiles = append(processedFiles, folderFiles...)
		} else {
			// Process single file
			if info.Size() <= 500*1024 { // 500KB
				processedFiles = append(processedFiles, file)
			}
		}
	}
	return processedFiles, nil
}

// OnFileDrop handles the file drop event
func (a *App) OnFileDrop(files []string) {
	processedFiles, err := a.HandleFileDrop(files)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Error handling file drop: %v", err))
		return
	}

	// Emit an event with the processed files
	runtime.EventsEmit(a.ctx, "files-dropped", processedFiles)
}
