"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Order = { id: string; customer: string; email: string; phone: string; category: string; total: string; payment: string; shipping: string; method: string };

const stats = [["Ventas del mes", "$ 842.500"], ["Pedidos", "24"], ["Productos", "48"], ["Pendientes", "06"]];
const orders: Order[] = [
  { id: "#CH-00124", customer: "Sofía Martínez", email: "sofia@mail.com", phone: "351 555 0124", category: "Zapatillas", total: "$ 119.900", payment: "Pago aprobado", shipping: "Preparando", method: "Andreani" },
  { id: "#CH-00123", customer: "Tomás Roldán", email: "tomas@mail.com", phone: "351 555 0123", category: "Ropa", total: "$ 54.900", payment: "Pago aprobado", shipping: "Preparando", method: "Cadetería" },
  { id: "#CH-00122", customer: "Lara Gómez", email: "lara@mail.com", phone: "351 555 0122", category: "Ropa", total: "$ 168.800", payment: "Pago aprobado", shipping: "Enviado", method: "Retiro local" },
  { id: "#CH-00121", customer: "Nicolás Vera", email: "nico@mail.com", phone: "351 555 0121", category: "Zapatillas", total: "$ 134.900", payment: "Pendiente", shipping: "Pendiente", method: "Andreani" },
];

export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [payment, setPayment] = useState("Todos");
  const [method, setMethod] = useState("Todos");
  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = `${order.id} ${order.customer} ${order.email} ${order.phone}`.toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (category === "Todas" || order.category === category) && (payment === "Todos" || order.payment === payment) && (method === "Todos" || order.method === method);
    });
  }, [category, method, payment, query]);

  function clearFilters() { setQuery(""); setCategory("Todas"); setPayment("Todos"); setMethod("Todos"); }

  return <main className="admin"><header className="admin-head"><div className="admin-brand"><Link className="brand" href="/"><Image src="/LOGO.jpeg" alt="" width={35} height={35} /> chifle.</Link><div><span className="eyebrow">Panel de control</span><h1>Hola, Nacho.</h1></div></div><Link className="text-link" href="/">Ver tienda ↗</Link></header><nav className="admin-nav" aria-label="Secciones del panel"><Link className="active" href="/admin">Pedidos</Link><Link href="/admin/envios">Envíos</Link><button type="button">Productos</button><button type="button">Configuración</button></nav><div className="admin-grid">{stats.map(([label, value]) => <div className="stat" key={label}><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong></div>)}</div><section className="admin-panel"><div className="panel-title-row"><div><span className="eyebrow">Operación</span><h2>Pedidos</h2></div><span className="result-count">{filteredOrders.length} resultados</span></div><div className="order-filters"><label className="search-field">Buscar pedido<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, nombre, email o teléfono" /></label><label> Categoría<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option><option>Ropa</option><option>Zapatillas</option></select></label><label>Pago<select value={payment} onChange={(event) => setPayment(event.target.value)}><option>Todos</option><option>Pago aprobado</option><option>Pendiente</option></select></label><label>Entrega<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Todos</option><option>Andreani</option><option>Cadetería</option><option>Retiro local</option></select></label><button className="clear-filters" type="button" onClick={clearFilters}>Limpiar</button></div>{filteredOrders.length === 0 ? <div className="admin-empty">No encontramos pedidos con esos filtros.<button type="button" onClick={clearFilters}>Ver todos los pedidos</button></div> : <div className="orders-list">{filteredOrders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.id}</strong><span>{order.customer}</span><small>{order.email} · {order.phone}</small></div><div><span className="order-category">{order.category}</span><small>{order.method}</small></div><strong>{order.total}</strong><div><span className="status">{order.payment}</span><small>{order.shipping}</small></div></article>)}</div>}</section></main>;
}
