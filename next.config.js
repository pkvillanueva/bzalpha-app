const path = require( 'path' );
const antdLessLoader = require( 'next-antd-aza-less' );

if ( typeof require !== 'undefined' ) {
  require.extensions['.less'] = () => {};
}

module.exports = antdLessLoader( {
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: "[hash:base64:5]",
  },
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  webpack: ( config, options ) => {
    const { isServer } = options;

    if ( isServer ) {
      const antStyles = /antd\/.*?\/style.*?/;
      const origExternals = [ ...config.externals ];
      config.externals = [
        ( context, request, callback ) => {
          if ( request.match( antStyles ) ) return callback();
          if ( typeof origExternals[0] === 'function' ) {
            origExternals[0]( context, request, callback );
          } else {
            callback();
          }
        },
        ...( typeof origExternals[0] === 'function' ? [] : origExternals ),
      ];

      config.module.rules.unshift( {
        test: antStyles,
        use: 'null-loader'
      } );
    }

    config.resolve.alias['~'] = path.join( __dirname );

    return config;
  }
} );
