package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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

// ReadFileContent reads the content of a file
func (a *App) ReadFileContent(filePath string) (string, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading file content: %v", err)
	}
	return string(content), nil
}
