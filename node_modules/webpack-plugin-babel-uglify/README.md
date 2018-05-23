What it does
============

Transpiles every emitted asset that has `.js` extension with `babel-core` and then minifies it with `uglify-js`.

Why
===

To use a full power of webpack's tree-shaking and thus have a minimal possible bundle's size you should ensure two things:
- import from es6 modules
- keep webpack's output in es6

Because this is how webpack works:
- it concatenates all imported modules and your code into a single file
- marks unused imports with special tags
- in production uses uglify plugin which strips all tokens marked as unused

Now, the problem is that if you use `babel-loader`, it transpiles each file into es5 and each class into a function. 
And webpack can not mark that transpiled classes as unused. (Of course this may change in the future). 
So, in this scenario all unused classes will remain in the final bundle. You can read more about it in this [article][1].

The idea of this plugin is that you will keep webpack's output as es6, then minify it. This time unused classes will be removed. 
And after that, to get es5 compatible bundle you will use this plugin, which transpiles es6 to es5 and then minifies again. 
So, in the end you will have transpiled and maximally compressed file.

You can run `npm test` command to compare sizes of produced files.

Of course, you could just write a small build script, which will do the same. But this plugin might be more convenient to use on different platforms.

Usage
=====

As webpack 4 now uses minifier which understands es6 (webpack 3 can not), your config simplifies to this:

```javascript
const BabelUglifyPlugin = require('webpack-plugin-babel-uglify')

module.exports = {
    ...
    plugins: [
        new BabelUglifyPlugin(x) // undefined - use defaults: env preset + sourceMaps
                                 // `true` - use .babelrc or package.json (default babel lookup)
                                 // {} - use these options
    ]
}
```

and then invoke like this:

`webpack --mode=production`

Todo
====

Add ability to filter input .js files?

License
=======

MIT

[1]: https://blog.craftlab.hu/how-to-do-proper-tree-shaking-in-webpack-2-e27852af8b21