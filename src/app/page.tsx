"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { UserMenu } from "@/components/user-menu";

type Product = { id: number; name: string; category: string; model: string; price: number; sizes: string[]; label?: string; mark: string };
type CartLine = Product & { size: string; quantity: number };

const PRODUCTS: Product[] = [
  { id: 1, name: "Remera Chifle Club", category: "Ropa", model: "Club 01", price: 28900, sizes: ["S", "M", "L", "XL"], label: "Nuevo", mark: "C" },
  { id: 2, name: "Hoodie Barrio Norte", category: "Ropa", model: "Barrio 02", price: 54900, sizes: ["S", "M", "L", "XL"], mark: "B" },
  { id: 3, name: "Zapatilla Patio Blanca", category: "Zapatillas", model: "Patio 01", price: 119900, sizes: ["39", "40", "41", "42", "43"], label: "Drop 01", mark: "P" },
  { id: 4, name: "Gorra El Centro", category: "Ropa", model: "Centro 01", price: 22900, sizes: ["Único"], mark: "E" },
  { id: 5, name: "Zapatilla Sierras", category: "Zapatillas", model: "Sierras 02", price: 134900, sizes: ["39", "40", "41", "42", "43"], label: "Limited", mark: "S" },
  { id: 6, name: "Pantalón Cargo 5000", category: "Ropa", model: "Cargo 01", price: 67900, sizes: ["S", "M", "L", "XL"], mark: "5" },
];

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const filtered = useMemo(() => category === "Todos" ? PRODUCTS : PRODUCTS.filter((product) => product.category === category), [category]);

  function addToCart(product: Product) {
    const size = product.sizes[Math.floor(product.sizes.length / 2)];
    setCart((current) => {
      const found = current.find((line) => line.id === product.id && line.size === size);
      if (found) return current.map((line) => line === found ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...product, size, quantity: 1 }];
    });
    setCartOpen(true);
  }
  function changeQuantity(id: number, size: string, delta: number) {
    setCart((current) => current.flatMap((line) => line.id === id && line.size === size ? (line.quantity + delta > 0 ? [{ ...line, quantity: line.quantity + delta }] : []) : [line]));
  }
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <main className="shell">
      <div className="announcement">Envíos a toda Argentina · Retiro en Córdoba Capital</div>
      <header className="nav">
        <Link className="brand" href="/" aria-label="Chifle Store, inicio"><Image src="/LOGO.jpeg" alt="" width={35} height={35} priority /> chifle<span>.</span></Link>
        <nav className="nav-links" aria-label="Navegación principal"><a href="#shop">Shop</a><a href="#manifiesto">Manifiesto</a><a href="#footer">Contacto</a></nav>
        <div className="nav-actions"><UserMenu /><button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${cartCount} productos`}>Carrito <span className="cart-count">({cartCount.toString().padStart(2, "0")})</span></button></div>
      </header>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><span className="eyebrow">Desde Córdoba, para todos lados</span><h1 id="hero-title">Vestite<br /><em>distinto.</em></h1><p className="hero-sub">Ropa y zapatillas para moverte con tu propio código. Sin permiso, sin manual.</p><div className="hero-cta"><a className="button-dark" href="#shop">Ver colección</a><a className="text-link" href="#manifiesto">Conocé Chifle</a></div></div><div className="hero-art" aria-label="Nueva colección Chifle Store"><div className="hero-sticker">HECHO<br />ACÁ</div><span className="hero-number">01 / 06 — DROP 2026</span></div></section>
      <div className="marquee" aria-hidden="true"><div className="marquee-inner">CHIFLE STORE · CÓRDOBA CAPITAL · STREETWEAR ARGENTINO · CHIFLE STORE · CÓRDOBA CAPITAL · STREETWEAR ARGENTINO · </div></div>
      <section className="section" id="shop" aria-labelledby="shop-title"><div className="section-heading"><div><span className="eyebrow">Drop 01 / 2026</span><h2 className="section-title" id="shop-title">La colección.</h2></div><p className="section-note">Diseñada en Córdoba.<br />Producida para durar.</p></div><div className="shop-layout"><aside className="filters" aria-label="Filtrar productos"><span className="filter-label">Filtrar por</span>{["Todos", "Ropa", "Zapatillas"].map((item) => <button className={`filter-button ${category === item ? "active" : ""}`} key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</aside><div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-image"><span className="product-art" aria-hidden="true">{product.mark}</span>{product.label && <span className="product-label">{product.label}</span>}</div><div className="product-info"><div><h3 className="product-name">{product.name}</h3><span className="product-meta">{product.model} · Talles {product.sizes.join(", ")}</span><br /><button className="add-button" onClick={() => addToCart(product)}>Agregar al carrito</button></div><span className="product-price">{money(product.price)}</span></div></article>)}</div></div></section>
      <section className="manifesto" id="manifiesto"><div className="manifesto-copy"><span className="eyebrow">Nuestro código</span><h2>No somos<br />de acá.</h2><p>Somos de donde se arma la movida. Chifle nace en Córdoba para los que encuentran su estilo antes que las tendencias.</p><a className="text-link" href="mailto:hola@chifle.store">Hablemos</a></div><div className="manifesto-mark" aria-hidden="true">CH.</div></section>
      <footer className="footer" id="footer"><small>© 2026 Chifle Store · Córdoba, Argentina</small><small>Envíos por Andreani · Cadetería local · Retiro</small><small><a href="mailto:hola@chifle.store">hola@chifle.store</a></small></footer>
      {cartOpen && <><button className="drawer-backdrop" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} /><aside className="cart-drawer" aria-label="Carrito de compras"><div className="drawer-head"><h2>Tu carrito ({cartCount})</h2><button className="close-button" onClick={() => setCartOpen(false)}>Cerrar ×</button></div><div className="cart-items">{cart.length === 0 ? <p className="empty">Todavía no agregaste nada.<br />El drop te está esperando.</p> : cart.map((line) => <div className="cart-item" key={`${line.id}-${line.size}`}><div className="cart-thumb" aria-hidden="true">{line.mark}</div><div><h3>{line.name}</h3><p>{line.size} · {money(line.price)}</p><div className="quantity"><button onClick={() => changeQuantity(line.id, line.size, -1)} aria-label={`Quitar una unidad de ${line.name}`}>−</button><span>{line.quantity}</span><button onClick={() => changeQuantity(line.id, line.size, 1)} aria-label={`Agregar una unidad de ${line.name}`}>+</button></div></div><button className="remove" onClick={() => changeQuantity(line.id, line.size, -line.quantity)}>Eliminar</button></div>)}</div>{cart.length > 0 && <div className="drawer-foot"><div className="total-line"><span>Subtotal</span><strong>{money(total)}</strong></div><Link className="button-dark full-button" href="/checkout">Ir al checkout</Link></div>}</aside></>}
    </main>
  );
}
