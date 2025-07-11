# TurboMini Documentation

## **Overview**

**TurboMini** is a lightweight JavaScript framework designed to handle client-side routing, templating, controllers, and basic state management for single-page applications (SPAs). Its simplicity makes it ideal for small to medium-sized projects where full-scale frameworks like React or Vue might be overkill.

### **Key Features**
- **Client-Side Routing:** Supports dynamic route management and browser history handling.
- **Templating:** Lightweight, precompiled templates with powerful data binding.
- **Controller Management:** Organize logic for each route.
- **State Management:** Proxy-based reactive state updates.
- **Middleware:** Pre-routing hooks for tasks like authentication.
- **Reusable Components:** Combine templates and controllers.
- **Debugging and Dev Tools:** Easy inspection and debugging.
- **Error Handling:** Centralized error management.

---

## **Getting Started**

### **Installation**
Include the `TurboMini` library in your project via a module import:

```javascript
import { TurboMini } from './path/to/turbomini.js';

const app = TurboMini('/basePath');
```

Replace `/basePath` with the base URL of your app (e.g., `/my-app`).

### **Basic Example**

```javascript
const app = TurboMini('/');

// Define a template
app.template('home', '<h1>Welcome, {{user.name}}</h1>');

// Define a controller
app.controller('home', async () => {
  return { user: { name: 'Alice' } };
});

// Start the app
app.start();
```

Add a `<page>` element to your HTML for dynamic rendering:

```html
<page></page>
```

Navigate to `#home` or `/home` to see the rendered content.

---

## **API Reference**

### **1. `app.template(name, text)`**
Registers a template by name.

#### Parameters:
- `name` (string): The template's unique name.
- `text` (string): The HTML string for the template, with `{{key}}` placeholders for data binding.

#### Example:
```javascript
app.template('profile', '<div>{{name}} is {{age}} years old</div>');
```

---

### **2. `app.controller(name, fn)`**
Registers a controller by name. The controller provides the data and logic for a route.

#### Parameters:
- `name` (string): The route's unique name.
- `fn` (function): An async function that returns data to be used by the template.

#### Example:
```javascript
app.controller('profile', async (params) => {
  return { name: 'John Doe', age: 30 };
});
```

---

### **3. `app.goto(route)`**
Navigates to a specified route programmatically.

#### Parameters:
- `route` (string): The route to navigate to (e.g., `/home`, `/profile/123`).

#### Example:
```javascript
app.goto('profile/123');
```

---

### **4. `app.start()`**
Starts the routing system and renders the initial route.

#### Example:
```javascript
app.start();
```

---

### **5. `app.refresh()`**
Manually re-renders the current page.

#### Example:
```javascript
app.refresh();
```

---

### **6. `app.addMiddleware(fn)`**
Adds a middleware function to be executed before routing.

#### Parameters:
- `fn` (function): A function that accepts the context and returns `false` to cancel routing.

#### Example:
```javascript
app.addMiddleware(async (ctx) => {
  if (ctx.page === 'admin' && !isAuthenticated()) {
    app.goto('login');
    return false;
  }
});
```

---

### **7. `app.defineComponent(name, { template, controller })`**
Defines a reusable component by combining a template and a controller.

#### Parameters:
- `name` (string): Component's name.
- `template` (string): HTML for the component.
- `controller` (function): Logic and data provider for the component.

#### Example:
```javascript
app.defineComponent('userCard', {
  template: '<div>{{user.name}}</div>',
  controller: async () => ({ user: { name: 'Bob' } })
});
```

---

### **8. `app.prefetchTemplates(names)`**
Preloads templates into memory to improve loading time.

#### Parameters:
- `names` (array): List of template names.

#### Example:
```javascript
app.prefetchTemplates(['home', 'profile']);
```

---

### **9. `app.fetchTemplates(templateNames, path)`**
Fetches templates from the server.

#### Parameters:
- `templateNames` (array): List of template filenames (without extensions).
- `path` (string): Path to the templates folder (defaults to `/components/`).

#### Example:
```javascript
app.fetchTemplates(['header', 'footer'], '/shared/');
```

---

### **10. `app.inspect()`**
Returns a list of registered routes and templates.

#### Example:
```javascript
console.log(app.inspect());
```

---

## **Advanced Topics**

### **1. Middleware**
Middleware functions execute before a route is processed and can modify or cancel the route.

#### Example:
```javascript
app.addMiddleware((context) => {
  console.log('Navigating to', context.page);
});
```

### **2. Router Events**
Respond to route lifecycle events (`routeChangeStart`, `routeChangeEnd`).

#### Example:
```javascript
app.routerEvents.addEventListener('routeChangeStart', () => {
  console.log('Route is changing...');
});

app.routerEvents.addEventListener('routeChangeEnd', () => {
  console.log('Route change completed!');
});
```

---

## **Best Practices**
- Keep controllers lightweight; move complex logic to utility functions.
- Prefetch templates and assets for routes frequently used.
- Use meaningful names for templates and controllers for better clarity.

---

## **Development and Debugging**
- Enable debugging by setting `app.debug = true`.
- Use `app.inspect()` to review all registered templates and routes.
- Centralize error logging with `app.errorHandler`.

---

## **FAQ**

### **Q: Can I use nested routes?**
A: Nested routes are not natively supported but can be handled by dynamically changing the `context.page`.

### **Q: How do I refresh a specific part of the page?**
A: Use a reusable component to manage that part and manually re-render it as needed.

---
