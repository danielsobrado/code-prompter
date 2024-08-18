package main

import (
	"fmt"
	"os"

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

func (a *App) getCurrentDirectory() string {
	dir, err := os.Getwd()
	if err != nil {
		return fmt.Sprintf("Error getting current directory: %v", err)
	}
	return dir
}

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
