import { TurboMini } from '../shared/turbomini.js';

const ORDERS = [
  { id: 'A-104', customer: 'Studio One', status: 'active', total: '$1,240' },
  { id: 'B-221', customer: 'Northwind', status: 'paused', total: '$860' },
  { id: 'C-388', customer: 'Axis Labs', status: 'active', total: '$2,400' },
  { id: 'D-542', customer: 'Goodline', status: 'pending', total: '$430' },
];

export function createApp() {
  const app = TurboMini('/real-app-dashboard');
  const store = {
    filter: 'all',
  };

  app.template(
    'default',
    `
    <main class="dashboard">
      <section class="card">
        <h1>Operations dashboard</h1>
        <p>Track orders, revenue, and fulfillment status.</p>
        <div class="filters">
          <button data-filter="all">All</button>
          <button data-filter="active">Active</button>
          <button data-filter="pending">Pending</button>
          <button data-filter="paused">Paused</button>
        </div>
      </section>

      <section class="stats">
        {{#each stats as stat}}
          <div class="card">
            <strong>{{stat.label}}</strong>
            <div>{{stat.value}}</div>
          </div>
        {{/each}}
      </section>

      <section class="card">
        <h2>Orders ({{filter}})</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each visibleOrders as order}}
              <tr>
                <td>{{order.id}}</td>
                <td>{{order.customer}}</td>
                <td>{{order.status}}</td>
                <td>{{order.total}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>
    </main>
    `
  );

  app.controller('default', () => {
    const visibleOrders =
      store.filter === 'all'
        ? ORDERS
        : ORDERS.filter((order) => order.status === store.filter);

    const stats = [
      { label: 'Orders', value: String(ORDERS.length) },
      { label: 'Active', value: String(ORDERS.filter((order) => order.status === 'active').length) },
      { label: 'Revenue', value: '$4.9k' },
    ];

    return {
      filter: store.filter,
      stats,
      visibleOrders,
      postLoad() {
        const root = document.querySelector('.dashboard');
        if (!root || root.dataset.bound) return;
        root.dataset.bound = 'true';
        root.addEventListener('click', (event) => {
          const value = event.target?.dataset?.filter;
          if (!value) return;
          store.filter = value;
          app.invalidate();
        });
      }
    };
  });

  return { app, store };
}

export function startApp() {
  const { app } = createApp();
  app.start();
  return app;
}

if (typeof window !== 'undefined') {
  startApp();
}
