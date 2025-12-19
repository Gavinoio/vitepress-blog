---
title: Webpack 性能优化完全指南
date: 2024-12-16
categories:
  - 前端开发
tags:
  - Webpack
  - 构建工具
  - 性能优化
cover: https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920
---

# Webpack 性能优化完全指南

虽然 Vite 等新工具崛起，但 Webpack 仍然是许多大型项目的首选。本文将全面介绍 Webpack 的性能优化技巧。

## 构建速度优化

### 1. 使用最新版本

始终使用最新的 Webpack、Node.js 和 npm/yarn 版本。

```bash
# 升级到最新版本
npm install webpack@latest webpack-cli@latest -D
```

### 2. 缩小构建范围

**配置 loader 的作用范围：**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        exclude: /node_modules/ // 排除 node_modules
      }
    ]
  }
}
```

**优化 resolve 配置：**

```javascript
module.exports = {
  resolve: {
    // 减少解析路径
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],

    // 明确扩展名
    extensions: ['.js', '.json', '.jsx'],

    // 别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    },

    // 优先使用 ES 模块
    mainFields: ['jsnext:main', 'browser', 'main']
  }
}
```

### 3. 使用 DLL 插件

DLL 可以将不常变化的代码预先打包。

**第一步：创建 DLL 配置文件**

```javascript
// webpack.dll.config.js
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    vendor: ['vue', 'vue-router', 'vuex', 'axios']
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_library',
      path: path.resolve(__dirname, 'dll', '[name]-manifest.json')
    })
  ]
}
```

**第二步：在主配置中引用**

```javascript
// webpack.config.js
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor-manifest.json')
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, 'dll/vendor.dll.js')
    })
  ]
}
```

### 4. 多进程构建

**使用 thread-loader：**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 3 // 进程数
            }
          },
          'babel-loader'
        ]
      }
    ]
  }
}
```

**使用 TerserPlugin 并行压缩：**

```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多进程并行
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}
```

### 5. 持久化缓存

Webpack 5 内置持久化缓存：

```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]
    }
  }
}
```

Webpack 4 使用 cache-loader：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['cache-loader', 'babel-loader']
      }
    ]
  }
}
```

## 产物体积优化

### 1. 代码分割

**入口分割：**

```javascript
module.exports = {
  entry: {
    app: './src/main.js',
    vendor: ['vue', 'vue-router', 'axios']
  }
}
```

**动态导入：**

```javascript
// 路由懒加载
const Home = () => import(/* webpackChunkName: "home" */ './views/Home.vue')
const About = () => import(/* webpackChunkName: "about" */ './views/About.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]
```

**SplitChunks 优化：**

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // 提取公共代码
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        },
        // 提取 Vue 全家桶
        vue: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
          name: 'vue-vendor',
          priority: 20
        },
        // 提取 UI 库
        ui: {
          test: /[\\/]node_modules[\\/](element-ui|ant-design-vue)[\\/]/,
          name: 'ui-vendor',
          priority: 15
        }
      }
    },
    // 提取 runtime 代码
    runtimeChunk: {
      name: 'runtime'
    }
  }
}
```

### 2. Tree Shaking

确保使用 ES6 模块语法，并配置正确：

```javascript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.vue"
  ]
}
```

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // production 模式默认启用
  optimization: {
    usedExports: true, // 标记未使用的导出
    sideEffects: true  // 识别 sideEffects 标志
  }
}
```

### 3. 压缩优化

**压缩 JavaScript：**

```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'] // 移除指定函数
          },
          output: {
            comments: false // 移除注释
          }
        },
        extractComments: false
      })
    ]
  }
}
```

**压缩 CSS：**

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ]
  }
}
```

**压缩 HTML：**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyJS: true,
        minifyCSS: true
      }
    })
  ]
}
```

### 4. 图片优化

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于 10kb 转 base64
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    // 图片压缩
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ['imagemin-mozjpeg', { quality: 80 }],
            ['imagemin-pngquant', { quality: [0.6, 0.8] }]
          ]
        }
      }
    })
  ]
}
```

### 5. 外部化依赖 (Externals)

对于大型库，可以使用 CDN：

```javascript
module.exports = {
  externals: {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    'vuex': 'Vuex',
    'axios': 'axios',
    'element-ui': 'ELEMENT'
  }
}
```

在 HTML 中引入 CDN：

```html
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4"></script>
```

## 运行时优化

### 1. 模块标识符优化

```javascript
module.exports = {
  optimization: {
    // 使用确定性的模块 ID
    moduleIds: 'deterministic',
    // 使用确定性的 chunk ID
    chunkIds: 'deterministic'
  }
}
```

### 2. 预加载和预获取

```javascript
// 预加载（高优先级）
import(/* webpackPreload: true */ './critical-module')

// 预获取（低优先级）
import(/* webpackPrefetch: true */ './future-module')
```

### 3. 长期缓存

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  optimization: {
    // 提取 runtime 代码，避免影响其他 chunk 的 hash
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
```

## 分析工具

### 1. Webpack Bundle Analyzer

可视化分析打包产物：

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
}
```

### 2. Speed Measure Plugin

分析各个 loader 和 plugin 的耗时：

```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  // 你的 webpack 配置
})
```

## 完整优化配置示例

```javascript
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/main.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    },
    runtimeChunk: 'single',
    moduleIds: 'deterministic'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ],

  cache: {
    type: 'filesystem'
  }
}
```

## 总结

Webpack 性能优化关键点：

1. **构建速度**：缩小构建范围、使用缓存、并行处理
2. **产物体积**：代码分割、Tree Shaking、压缩优化
3. **运行时性能**：长期缓存、预加载策略
4. **持续优化**：使用分析工具，定期检查

合理的优化配置能够显著提升项目的构建速度和运行性能。

参考资源：
- [Webpack 官方文档](https://webpack.js.org/)
- [Webpack 优化指南](https://webpack.js.org/guides/build-performance/)
