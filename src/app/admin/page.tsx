import Link from "next/link";

const stats = [["Ventas del mes", "$ 842.500"], ["Pedidos", "24"], ["Productos", "48"], ["Pendientes", "06"]];
const orders = [["#CH-00124", "Sofía Martínez", "$ 119.900", "Pago aprobado"], ["#CH-00123", "Tomás Roldán", "$ 54.900", "Preparando"], ["#CH-00122", "Lara Gómez", "$ 168.800", "Enviado"]];

export default function AdminPage() {
  return <main className="admin"><header className="admin-head"><div><span className="eyebrow">Panel de control</span><h1>Hola, Nacho.</h1></div><Link className="text-link" href="/">Ver tienda ↗</Link></header><div className="admin-grid">{stats.map(([label, value]) => <div className="stat" key={label}><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong></div>)}</div><section className="admin-panel"><h2>Pedidos recientes</h2>{orders.map(([id, customer, total, status]) => <div className="order-row" key={id}><span>{id}</span><span>{customer}</span><span>{total}</span><span className="status">{status}</span></div>)}</section><section className="admin-panel" style={{ marginTop: 55 }}><h2>Acciones rápidas</h2><div className="hero-cta"><button className="button-dark">Nuevo producto</button><button className="add-button">Configurar envíos</button><button className="add-button">Editar políticas</button></div></section></main>;
}
