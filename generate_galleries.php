<?php

$gallery_path = "gallery/";
$path_array = array();

// Recursively loop through all files in the gallery directory
// Assuming that the files are image files and each gallery is 1 folder deep for display on webpage
$dir  = new RecursiveDirectoryIterator($gallery_path, RecursiveDirectoryIterator::SKIP_DOTS);
$files = new RecursiveIteratorIterator($dir, RecursiveIteratorIterator::LEAVES_ONLY);

// Keep track of the current folder name, start at index -1 so first folder is at 0 and json_encode gives us an array instead of an object
$folder = "";
$index = -1;
foreach ($files as $file) {
    // Get second folder name, eg /gallery/galleryname, clean up name
    $nextfolder = explode("/", $file->getPathName())[1];
    $nextfolder = str_replace("_", " ", $nextfolder);
    $nextfolder = ucwords($nextfolder);

    // Separate each folder of images
    if ($folder != $nextfolder) {
      $index++;
      $folder = $nextfolder;
      $path_array[$index]['title'] = $folder;
    }
    $path_array[$index]['images'][] = $file->getPathName();
}

file_put_contents('/galleries.json', json_encode($path_array));