# Quick Sort Visualizer (C++ / WebAssembly)

:- Live demo: https://mind2308.github.io/Quick-Sort-Visualization/
:- Source code: https://github.com/mind2308/Quick-Sort-Visualization

An interactive, browser-based Quick Sort demonstration. The sorting algorithm is written in C++, compiled to WebAssembly with Emscripten, and displayed using HTML, CSS, and JavaScript.

## Features

- Enter comma-separated integers, including negative numbers and duplicates.
- Step through pivot selection, comparisons, partition decisions, swaps, and recursive base cases.
- Previous, next, reset, and auto-play controls.
- Shows comparison and swap counts.
- Responsive interface and sample input buttons.
- GitHub Actions automatically compiles the C++ source and deploys the website to GitHub Pages.

## How Quick Sort works here

This project uses the **Lomuto partition scheme** and selects the last element in each active range as the pivot. During partitioning, values less than or equal to the pivot are moved to its left. The pivot is then placed in its final sorted position, and Quick Sort recursively processes the ranges on either side.

## Run locally

The website needs a compiled `site/quicksort.js` and `site/quicksort.wasm`. The easiest route is to push the project to GitHub and let the included workflow compile and deploy it.

If you have Emscripten installed locally, from the project root run:

```bash
em++ src/quicksort.cpp -O2 --bind -s MODULARIZE=1 -s EXPORT_NAME=createQuickSortModule -s ENVIRONMENT=web -o site/quicksort.js
```

Then serve the `site` directory through a local web server (for example, VS Code Live Server). Opening `index.html` directly as a `file://` URL may not work because browsers restrict WebAssembly file loading.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository named `quick-sort-visualizer`.
2. Upload the files and folders from this project, keeping their folder structure.
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment source, choose **GitHub Actions**.
5. Open the **Actions** tab and wait for “Build and deploy Quick Sort Visualizer” to finish successfully.
6. Your live site URL will appear in the deployment summary and under **Settings → Pages**. It will usually look like `https://YOUR-USERNAME.github.io/quick-sort-visualizer/`.

## Project structure

```text
quick-sort-visualizer/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── site/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   └── quicksort.cpp
└── README.md
```

## Complexity

- Average time: `O(n log n)`
- Worst-case time: `O(n²)`
- Average auxiliary space: `O(log n)`; worst case can be `O(n)` due to recursion.

## Credits

Made as a learning project to demonstrate the Quick Sort algorithm in C++.
