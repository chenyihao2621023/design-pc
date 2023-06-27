//magix-composer#snippet;
//magix-composer#exclude = define,before
/**
 * Sea.js 2.2.3 | seajs.org/LICENSE.md
 */
/*!Sea.js 2.2.3|https://github.com/seajs/seajs/blob/master/LICENSE.md*/
(global => {

  // Avoid conflicting when `sea.js` is loaded multiple times
  if (!global.s) {

    let seajs = global.s = {
      // The current version of Sea.js being used
      //version: "2.2.3"
    }
    if (DEBUG) {
      seajs['@:{data}'] = {};
    }

    /**
     * util-lang.js - The minimal language enhancement
     */

    // let isType = (type) => {
    //   return (obj) => {
    //     return {}.toString.call(obj) == `[object ${type}]`
    //   }
    // }

    //let isObject = isType("Object")
    //let isString = isType("String")
    //let isArray = Array.isArray
    //let isFunction = isType("Function")

    let _cid = 0

    // /**
    //  * util-events.js - The minimal events support
    //  */

    // let events = data.events = {}

    // // Bind event
    // seajs.on = function(name, callback) {
    //   var list = events[name] || (events[name] = [])
    //   list.push(callback)
    //   return seajs
    // }

    // // Remove event. If `callback` is undefined, remove all callbacks for the
    // // event. If `event` and `callback` are both undefined, remove all callbacks
    // // for all events
    // seajs.off = function(name, callback) {
    //   // Remove *all* events
    //   if (!(name || callback)) {
    //     events = data.events = {}
    //     return seajs
    //   }

    //   var list = events[name]
    //   if (list) {
    //     if (callback) {
    //       for (var i = list.length - 1; i >= 0; i--) {
    //         if (list[i] === callback) {
    //           list.splice(i, 1)
    //         }
    //       }
    //     }
    //     else {
    //       delete events[name]
    //     }
    //   }

    //   return seajs
    // }

    // Emit event, firing all bound callbacks. Callbacks receive the same
    // arguments as `emit` does, apart from the event name
    //var emit = seajs.emit = function(name, data) {
    // var list = events[name], fn

    // if (list) {
    //   // Copy callback lists to prevent modification
    //   list = list.slice()

    //   // Execute event callbacks
    //   while ((fn = list.shift())) {
    //     fn(data)
    //   }
    // }

    // return seajs
    //}


    /**
     * util-path.js - The utilities for operating path such as id, uri
     */

    let DIRNAME_RE = /[^?#]*\//

    let DOT_RE = /\/\.\//g
    let DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
    let DOUBLE_SLASH_RE = /([^:/])\/\//g

    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2
    let dirname = path => path.match(DIRNAME_RE)[0];
    let has = (owner, key) => owner.hasOwnProperty(key);

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    let realpath = path => {
      // /a/b/./c/./d ==> /a/b/c/d
      path = path.replace(DOT_RE, "/")

      // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
      while (path.match(DOUBLE_DOT_RE)) {
        path = path.replace(DOUBLE_DOT_RE, "/")
      }

      // a//b/c  ==>  a/b/c
      path = path.replace(DOUBLE_SLASH_RE, "$1/")

      return path
    }

    // Normalize an id
    // normalize("path/to/a") ==> "path/to/a.js"
    // NOTICE: substring is faster than negative slice and RegExp
    // let normalize = (path) => {
    //   return path + '.js';
    //   // let last = path.length - 1
    //   // let lastC = path.charAt(last)

    //   // // If the uri ends with `#`, just return it without '#'
    //   // if (lastC === "#") {
    //   //   return path.substring(0, last)
    //   // }

    //   // return (path.substring(last - 2) === ".js" ||
    //   //   //path.indexOf("?") > 0 ||
    //   //   //path.substring(last - 3) === ".css" ||
    //   //   lastC === "/") ? path : path + ".js"
    // }



    // let parseAlias = (id) => {
    //   let alias = data.alias
    //   return isString(alias?.[id]) ? alias[id] : id
    // }



    let ABSOLUTE_RE = /^\/\/.|:\//
    let ROOT_DIR_RE = /^.*?\/\/.*?\//

    let id2Uri = (id, refUri) => {
      //if (!id) return ""

      //id = parseAlias(id)
      if (DEBUG) {
        let PATHS_RE = /^([^/:]+)(\/.+)$/
        let parsePaths = (id) => {
          let paths = seajs['@:{data}'].paths
          let m = id.match(PATHS_RE);
          if (paths?.[m?.[1]]) {
            return paths[m[1]] + m[2];
          }
          return id;
        }
        id = parsePaths(id)
      }
      //return addBase(id + '.js', refUri)
      id += '.js';
      let ret
      let first = id[0]

      // Absolute
      if (ABSOLUTE_RE.test(id)) {
        ret = id
      }
      // Relative
      else if (first === ".") {
        ret = realpath((refUri ? dirname(refUri) : cwd) + id)
      }
      // Root
      else if (first === "/") {
        let m = cwd.match(ROOT_DIR_RE)
        ret = m ? m[0] + id.substring(1) : id
      }
      // Top-level
      else {
        ret = loaderDir + id
      }

      // Add default protocol when uri begins with "//"
      // if (ret.indexOf("//") === 0) {
      //   ret = location.protocol + ret
      // }

      return ret
    }


    let doc = document
    let cwd = dirname(doc.URL)
    let scripts = doc.scripts;
    // Recommend to add `seajsnode` id for the `sea.js` script element
    let loaderScript = scripts[scripts.length - 1];

    // When `sea.js` is inline, set loaderDir to current working directory
    let loaderDir = dirname(loaderScript.src || cwd)




    // For Developers
    //seajs.resolve = id2Uri


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    let head = doc.head;
    //let baseElement = head.getElementsByTagName("base")[0]

    //let IS_CSS_RE = /\.css(?:\?|$)/i
    //let currentlyAddingScript
    //let interactiveScript

    // `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
    // ref:
    //  - https://bugs.webkit.org/show_activity.cgi?id=38995
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    let isOldWebKit = false;// +navigator.userAgent
    //.replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536


    let request = (url, callback/*, charset, crossorigin*/) => {
      let isCSS = false;// IS_CSS_RE.test(url)
      let node = doc.createElement(isCSS ? "link" : "script")

      // if (charset) {
      //   node.charset = charset
      // }

      // crossorigin default value is `false`.
      // if (crossorigin != null) {
      //   node.setAttribute("crossorigin", crossorigin)
      // }

      node.onload = node.onerror = () => {
        node.onload = node.onerror = null;// node.onreadystatechange = null

        // Remove the script to reduce memory leak
        //if (!isCSS && !data.debug) {
        head.removeChild(node)
        //}

        // Dereference the node
        node = null

        callback()
      }

      if (isCSS) {
        node.rel = "stylesheet"
        node.href = url
      }
      else {
        node.async = true
        node.src = url
      }

      // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
      // the end of the insert execution, so use `currentlyAddingScript` to
      // hold current node, for deriving url in `define` call
      //currentlyAddingScript = node

      // ref: #185 & http://dev.jquery.com/ticket/2709
      // baseElement ?
      //   head.insertBefore(node, baseElement) :
      head.append(node)

      //currentlyAddingScript = null
    }

    // let pollCss = (node, callback) => {
    //   let sheet = node.sheet
    //   let isLoaded

    //   // for WebKit < 536
    //   if (isOldWebKit) {
    //     if (sheet) {
    //       isLoaded = 1
    //     }
    //   }
    //   // for Firefox < 9.0
    //   else if (sheet) {
    //     try {
    //       if (sheet.cssRules) {
    //         isLoaded = 1
    //       }
    //     } catch (ex) {
    //       // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
    //       // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
    //       // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
    //       if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
    //         isLoaded = 1
    //       }
    //     }
    //   }

    //   setTimeout(() => {
    //     if (isLoaded) {
    //       // Place callback here to give time for style rendering
    //       callback()
    //     }
    //     else {
    //       pollCss(node, callback)
    //     }
    //   }, 20)
    // }

    // let getCurrentScript = () => {
    //   if (currentlyAddingScript) {
    //     return currentlyAddingScript
    //   }

    //   // For IE6-9 browsers, the script onload event may not fire right
    //   // after the script is evaluated. Kris Zyp found that it
    //   // could query the script nodes and the one that is in "interactive"
    //   // mode indicates the current script
    //   // ref: http://goo.gl/JHfFW
    //   if (interactiveScript?.readyState === "interactive") {
    //     return interactiveScript
    //   }

    //   let scripts = head.getElementsByTagName("script")

    //   for (let i = scripts.length; i--;) {
    //     let script = scripts[i]
    //     if (script.readyState === "interactive") {
    //       interactiveScript = script
    //       return interactiveScript
    //     }
    //   }
    // }


    // For Developers
    //seajs.request = request



    /**
     * module.js - The core of module loader
     */

    let cachedMods = {}
    let anonymousMeta

    let fetchingList = {}
    let fetchedList = {}
    let callbackList = {}

    let FETCHING = 1,
      SAVED = 2,
      LOADING = 3,
      LOADED = 4,
      EXECUTING = 5,
      EXECUTED = 6;


    function Module(uri, deps = []) {
      this.uri = uri
      this['@:{m#deps}'] = deps
      this['@:{m#exports}'] = null
      this['@:{m#status}'] = 0

      // Who depends on me
      this['@:{m#waitings}'] = {}

      // The number of unloaded dependencies
      this['@:{m#remains}'] = 0
    }

    Object.assign(Module.prototype, {
      '@:{m#resolve}'() {
        let mod = this
        let ids = mod['@:{m#deps}']
        let uris = []
        for (let i = ids.length; i--;) {
          uris[i] = id2Uri(ids[i], mod.uri);
        }
        return uris
      },
      '@:{m#load}'() {
        let mod = this

        // If the module is being loaded, just wait it onload call
        if (mod['@:{m#status}'] < LOADING) {

          mod['@:{m#status}'] = LOADING

          // Emit `load` event for plugins such as combo plugin
          let uris = mod['@:{m#resolve}']()
          //emit("load", uris)

          let len = mod['@:{m#remains}'] = uris.length

          let m;
          // Initialize modules and register waitings
          for (let i = 0; i < len; i++) {
            m = Module['@:{m#get}'](uris[i])

            if (m['@:{m#status}'] < LOADED) {
              // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
              m['@:{m#waitings}'][mod.uri] = (m['@:{m#waitings}'][mod.uri] || 0) + 1
            }
            else {
              mod['@:{m#remains}']--
            }
          }

          if (mod['@:{m#remains}'] == 0) {
            mod['@:{m#onload}']()
          } else {

            // Begin parallel loading
            let requestCache = {}

            for (let i = 0; i < len; i++) {
              m = cachedMods[uris[i]]

              if (m['@:{m#status}'] < FETCHING) {
                m['@:{m#fetch}'](requestCache)
              }
              else if (m['@:{m#status}'] == SAVED) {
                m['@:{m#load}']()
              }
            }

            // Send all requests at last to avoid cache bug in IE6-9. Issues#808
            for (let requestUri in requestCache) {
              if (has(requestCache, requestUri)) {
                requestCache[requestUri]()
              }
            }
          }
        }
      },
      '@:{m#onload}'() {
        let mod = this
        mod['@:{m#status}'] = LOADED

        if (mod['@:{m#callback}']) {
          mod['@:{m#callback}']()
        }

        // Notify waiting modules to fire onload
        let waitings = mod['@:{m#waitings}']
        let uri, m

        for (uri in waitings) {
          if (has(waitings, uri)) {
            m = cachedMods[uri]
            m['@:{m#remains}'] -= waitings[uri]
            if (m['@:{m#remains}'] === 0) {
              m['@:{m#onload}']()
            }
          }
        }

        // Reduce memory taken
        delete mod['@:{m#waitings}']
        delete mod['@:{m#remains}']
      },
      '@:{m#fetch}'(requestCache) {
        let mod = this
        let requestUri = mod.uri

        mod['@:{m#status}'] = FETCHING

        // Emit `fetch` event for plugins such as combo plugin
        //let emitData = { uri: uri }
        //emit("fetch", emitData)
        //let requestUri = emitData.requestUri || uri

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList[requestUri]) {
          mod['@:{m#load}']();
        } else {

          if (fetchingList[requestUri]) {
            callbackList[requestUri].push(mod);
          } else {

            fetchingList[requestUri] = 1
            callbackList[requestUri] = [mod]

            let onRequest = () => {
              delete fetchingList[requestUri]
              fetchedList[requestUri] = 1

              // Save meta data of anonymous module
              if (anonymousMeta) {
                Module['@:{m#save}'](requestUri, anonymousMeta)
                anonymousMeta = null
              }

              // Call callbacks
              let m, mods = callbackList[requestUri]
              delete callbackList[requestUri]
              while ((m = mods.shift())) m['@:{m#load}']()
            }

            let sendRequest = () => {
              request(requestUri, onRequest);//, data.charset, data.crossorigin)
            }
            requestCache ?
              requestCache[requestUri] = sendRequest :
              sendRequest()
          }
        }
      },
      '@:{m#exec}'() {
        let mod = this

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod['@:{m#status}'] < EXECUTING) {

          mod['@:{m#status}'] = EXECUTING

          // Create require
          let uri = mod.uri

          let require = id => {
            //return Module.get(require.resolve(id)).exec()
            return Module['@:{m#get}'](id2Uri(id, uri))['@:{m#exec}']()
          }

          // require.resolve = (id) => {
          //   return id2Uri(id, uri)
          // }

          // require.async = (ids, callback) => {
          //   Module.use(ids, callback, uri + "_@:{async}_" + cid())
          //   return require
          // }

          let exports = mod['@:{m#factory}'](require);


          // Reduce memory leak
          delete mod['@:{m#factory}'];

          mod['@:{m#exports}'] = exports
          mod['@:{m#status}'] = EXECUTED

        }
        // Emit `exec` event
        //emit("exec", mod)

        return mod['@:{m#exports}']
      }
    });

    // Define a module
    seajs.d = (id, deps, factory) => {
      if (!factory) {
        factory = deps;
        deps = [];
      }

      let meta = {
        id: id,
        uri: id2Uri(id),
        deps: deps,
        f: factory
      }

      // Try to derive uri in IE6-9 for anonymous modules
      // if (!meta.uri && doc.attachEvent) {
      //   let script = getCurrentScript()

      //   if (script) {
      //     meta.uri = script.src
      //   }

      //   // NOTE: If the id-deriving methods above is failed, then falls back
      //   // to use onload event to get the uri
      // }

      // Emit `define` event, used in nocache plugin, seajs node version etc
      //emit("define", meta)

      meta.uri ? Module['@:{m#save}'](meta.uri, meta) :
        // Save information for "saving" work in the script onload event
        anonymousMeta = meta
    }

    // Save meta data to cachedMods
    Module['@:{m#save}'] = (uri, meta) => {
      let mod = Module['@:{m#get}'](uri)

      // Do NOT override already saved modules
      if (mod['@:{m#status}'] < SAVED) {
        mod.id = meta.id || uri
        mod['@:{m#deps}'] = meta.deps;// || []
        mod['@:{m#factory}'] = meta.f
        mod['@:{m#status}'] = SAVED
      }
    }

    // Get an existed module or create a new one
    Module['@:{m#get}'] = (uri, deps) => {
      return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
    }

    // Use function is equal to load a anonymous module
    seajs.use = (ids, callback) => {
      let uri = cwd + "_@:{use}_" + _cid++;
      let mod = Module['@:{m#get}'](uri, ids);

      mod['@:{m#callback}'] = () => {
        let exports = []
        let uris = mod['@:{m#resolve}']()

        for (let i = 0, len = uris.length; i < len; i++) {
          exports[i] = cachedMods[uris[i]]['@:{m#exec}']()
        }

        callback?.apply(global, exports);

        delete mod['@:{m#callback}'];
      }

      mod['@:{m#load}']()
    }
    // For Developers

    //seajs.Module = Module
    //data.fetchedList = fetchedList
    //data.cid = cid

    seajs.r = id => {
      let mod = Module['@:{m#get}'](id2Uri(id))
      if (mod['@:{m#status}'] < EXECUTING) {
        mod['@:{m#onload}']()
        mod['@:{m#exec}']()
      }
      return mod['@:{m#exports}']
    }


    /**
     * config.js - The configuration for the loader
     */

    // The root path to use for id2uri parsing
    // If loaderUri is `http://test.com/libs/seajs/[??][seajs/1.2.3/]sea.js`, the
    // baseUri should be `http://test.com/libs/`
    //data.base = loaderDir;

    // The loader directory
    //data.dir = loaderDir

    // The current working directory
    //data.cwd = cwd

    // The charset for requesting files
    //data.charset = "utf-8"

    seajs.rp = realpath;
    // The history of every config
    //data.history = {}

    // The CORS options, Do't set CORS on default.
    //data.crossorigin = undefined


    // data.alias - An object containing shorthands of module id
    // data.paths - An object containing path shorthands in module id
    // data.vars - The {xxx} variables in module id
    // data.map - An array containing rules to map module uri
    // data.debug - Debug mode. The default value is false
    if (DEBUG) {
      seajs.config = configData => {

        for (let key in configData) {
          let curr = configData[key]
          // let prev = data[key]


          // // Merge object config such as alias, lets
          // if (prev && isObject(prev)) {
          //   for (let k in curr) {
          //     prev[k] = curr[k]
          //   }
          // }
          // else {
          //   // Concat array config such as map, preload
          //   if (isArray(prev)) {
          //     curr = prev.concat(curr)
          //   }

          // Set config
          seajs['@:{data}'][key] = curr
          //}
        }

        //emit("config", configData)
        return seajs
      }
    }
  }
})(window);