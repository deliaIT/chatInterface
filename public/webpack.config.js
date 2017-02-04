module.exports = {
    entry: "./public/app.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
            ,{
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                minimize: true
                }
            }
            ,{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.woff$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff&name=[path][name].[ext]"
                }, 
            {
                test: /\.woff2$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff2&name=[path][name].[ext]"
                }, 
            {
                test: /\.(eot|ttf|svg|gif|png)$/,
                loader: "file-loader"
                }
        ]
    }
};