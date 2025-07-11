const TurboMini = ((basePath) => {
  const useHash = /\.html/.test(document.baseURI);
  const state = new Proxy({}, {
    set(target, prop, value) {
      target[prop] = value;
      app.refresh(); // Automatically refresh on state change
      return true;
    },
  });
  const controllers = {};
  const templates = {};
  const middleware = [];
  const routerEvents = new EventTarget();
  const context = { page: 'default', params: [], controller: null };
  const $ = (s, e, a) => (e || document)['querySelector' + (a ? 'All' : '')](s) || {};
  const debug = (...args) => app.debug && console.log('[TurboMini Debug]', ...args);

  // Precompile templates to JavaScript functions
  const compileTemplate = (template) => {
    return new Function('data', `
      with(data) { 
        return \`${template.replace(/\{\{(.+?)\}\}/g, '${$1}')}\`; 
      }
    `);
  };

  const template = (name, text) => {
    if (typeof name !== 'string' || typeof text !== 'string') {
      throw new TypeError('Template name and text must be strings.');
    }
    templates[name] = compileTemplate(text);
    return app;
  };

  const $t = (name, data) => {
    const render = templates[name];
    if (!render) throw new Error(`Template "${name}" not found.`);
    try {
      return render(data);
    } catch (e) {
      app.errorHandler?.(e);
      return '';
    }
  };

  const applyMiddleware = async () => {
    for (let fn of middleware) {
      const result = await fn(context);
      if (result === false) return false; // Cancel routing
    }
    return true;
  };

  const getElementByPath = (path, body) => {
    let element = body;
    for (const index of path) {
      if (!element.children || index >= element.children.length) {
        throw new Error("Invalid path: Unable to navigate to the specified element.");
      }
      element = element.children[index];
    }
    return element;
  };

  const walk = (path, rootLive, doc1, doc2) => {
    const node1 = getElementByPath(path, doc1.body);
    const node2 = getElementByPath(path, doc2.body);
    const nodeLive = getElementByPath(path, rootLive);
    const outer = node1.outerHTML === node2.outerHTML;
    const inner = node1.innerHTML === node2.innerHTML;
    const updateOuter = () => {
      if(!outer) {
        for(let attribute of nodeLive.attributes) {
          if(!['value', 'checked'].includes(attribute.name)) {
            nodeLive.removeAttribute(attribute.name);
          }
        }
        for(let attribute of node2.attributes) {
          if(attribute.name==='value') {
            nodeLive.value = attribute.value;
          }
          else if(attribute.name==='checked') {
            nodeLive.checked = attribute.value;
          }
          else {
            nodeLive.setAttribute(attribute.name, attribute.value);
          }
        }
      }
    };
    if(inner && !outer) {
      updateOuter();
    }
    else {
      if(!inner) {
        updateOuter();
        const children1 = Array.from(node1.children).map(child => child.tagName).join('');
        const children2 = Array.from(node2.children).map(child => child.tagName).join('');
        if(children1 === children2) {
          for(let i = 0; i < node1.children.length; i++) {
            walk([...path, i], rootLive, doc1, doc2);
          }
          if(!children1.length) {
            //updateOuter();
            nodeLive.innerHTML = node2.innerHTML;
          }
        }
        else {
          //updateOuter();
          nodeLive.innerHTML = node2.innerHTML;
        }
      }
    }
  };

  let lastHTML = null;

  const refresh = () => {
    console.log('refresh');
    try {
      const pageElement = $('page');
      if (!pageElement) throw new Error('<page> element not found in the DOM.');
      const nextHTML = $t(context.page, context.controller);
      if(lastHTML) {
        const parser = new DOMParser();
        const doc1 = parser.parseFromString(lastHTML, 'text/html');
        const doc2 = parser.parseFromString(nextHTML, 'text/html');
        walk([], pageElement, doc1, doc2);
      } else {
        pageElement.innerHTML = nextHTML;
      }
      lastHTML = nextHTML;
    } catch (e) {
      app.errorHandler?.(e);
    }
  };

  const start = async () => {
    try {
      routerEvents.dispatchEvent(new Event('routeChangeStart'));

      await context.controller?.unload?.();

      [context.page, ...context.params] = (useHash ? window.location.hash : window.location.pathname)
        .replace(basePath, '')
        .replace(/^[\/#]/, '')
        .split('/');
      context.page = context.page || 'default';

      if (!(await applyMiddleware())) return;

      debug('Route Context:', context);

      context.controller = controllers[context.page]
        ? await controllers[context.page](context.params)
        : null;
      window.controller = context.controller || {};
      window.controller.goto = gotoFn;
      window.controller.$t = $t;
      window.controller.page = context.page;
      refresh();

      await context.controller?.postLoad?.();

      routerEvents.dispatchEvent(new Event('routeChangeEnd'));

      (window.scrollRoot || document.body).scrollIntoView();
    } catch (e) {
      app.errorHandler?.(e);
    }
  };

  const gotoFn = (route) => {
    if (useHash) {
      document.location.hash = route;
    } else {
      const fullPath = new URL(route, document.location.origin).toString();
      if (fullPath !== document.location.pathname) {
        window.history.pushState({}, null, fullPath);
      }
      start();
    }
  };

  const controller = (name, fn) => {
    if (typeof fn !== 'function') throw new TypeError(`Controller "${name}" must be a function.`);
    controllers[name] = fn;
    return app;
  };

  const fetchTemplates = (templateNames, path = '/components/') => {
    return Promise.all(
      templateNames.map(async (name) => {
        const response = await fetch(`${path}${name}.html`);
        if (!response.ok) throw new Error(`Failed to fetch template "${name}": ${response.statusText}`);
        const text = await response.text();
        app.template(name, text);
      })
    );
  };

  const prefetchTemplates = (names) => {
    debug('Prefetching templates:', names);
    return fetchTemplates(names);
  };

  const addMiddleware = (fn) => {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be a function.');
    middleware.push(fn);
  };

  const defineComponent = (name, { template, controller }) => {
    app.template(name, template);
    app.controller(name, controller);
  };

  window.addEventListener('popstate', start);

  const app = {
    $, $t, goto:gotoFn, start, refresh, controller, template, fetchTemplates, prefetchTemplates,
    defineComponent, addMiddleware, context, state, useHash, routerEvents, debug: true,
    errorHandler: (e) => console.error('[TurboMini Error]', e)
  };

  app.run = async (fn) => {
    await fn(app);
    return app;
  };

  app.inspect = () => ({
    routes: Object.keys(controllers),
    templates: Object.keys(templates),
  });

  return app;
});

export { TurboMini };
