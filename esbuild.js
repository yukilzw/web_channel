require('esbuild').buildSync({
    entryPoints: ['./src/edit/index.js'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    define: {
        'process.env.NODE_ENV': '"production"'
    },
    loader: {
        '.js': 'jsx'
    },
    outfile: './.build/edit-es/main.js'
});