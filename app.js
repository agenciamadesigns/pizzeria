const numeroWhatsApp = "526621668765";

const productos = [
  {
    id: 1,
    nombre: "Pizza Pepperoni",
    categoria: "pizza",
    descripcion: "Queso mozzarella, salsa de tomate artesanal y pepperoni.",
    imagen: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
    precios: {
      Chica: 120,
      Mediana: 180,
      Grande: 240,
      Familiar: 320
    }
  },
  {
    id: 2,
    nombre: "Pizza Hawaiana",
    categoria: "pizza",
    descripcion: "Jamón, piña, queso mozzarella y salsa especial de la casa.",
    imagen: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80",
    precios: {
      Chica: 125,
      Mediana: 185,
      Grande: 245,
      Familiar: 325
    }
  },
  {
    id: 3,
    nombre: "Pizza Carnes Frías",
    categoria: "pizza",
    descripcion: "Pepperoni, jamón, salchicha italiana, tocino y extra queso.",
    imagen: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=80",
    precios: {
      Chica: 145,
      Mediana: 210,
      Grande: 280,
      Familiar: 360
    }
  },
  {
    id: 4,
    nombre: "Pizza Mexicana",
    categoria: "pizza",
    descripcion: "Chorizo, jalapeño, cebolla, carne molida y queso mozzarella.",
    imagen: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
    precios: {
      Chica: 140,
      Mediana: 205,
      Grande: 275,
      Familiar: 355
    }
  },
  {
    id: 5,
    nombre: "Pasta Alfredo",
    categoria: "pasta",
    descripcion: "Pasta cremosa con salsa Alfredo, pollo y queso parmesano.",
    imagen: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80",
    precio: 155
  },
  {
    id: 6,
    nombre: "Pasta Bolognesa",
    categoria: "pasta",
    descripcion: "Pasta con salsa de tomate, carne molida y queso parmesano.",
    imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    precio: 145
  },
  {
    id: 7,
    nombre: "Boneless BBQ",
    categoria: "entrada",
    descripcion: "Boneless bañados en salsa BBQ, acompañados con aderezo ranch.",
    imagen: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
    precio: 135
  },
  {
    id: 8,
    nombre: "Papas Gajo",
    categoria: "entrada",
    descripcion: "Papas crujientes sazonadas, acompañadas con aderezo especial.",
    imagen: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=80",
    precio: 85
  },
  {
    id: 9,
    nombre: "Refresco 600ml",
    categoria: "bebida",
    descripcion: "Refresco frío de diferentes sabores.",
    imagen: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=900&q=80",
    precio: 35
  },
  {
    id: 10,
    nombre: "Limonada Natural",
    categoria: "bebida",
    descripcion: "Limonada fresca preparada al momento.",
    imagen: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
    precio: 55
  }
];

const extras = [
  "Queso extra",
  "Pepperoni extra",
  "Jamón extra",
  "Tocino",
  "Champiñones",
  "Jalapeño",
  "Piña",
  "Aceitunas",
  "Cebolla",
  "Carne molida"
];

let carrito = [];
let productoSeleccionado = null;
let cantidad = 1;

const productosGrid = document.getElementById("productosGrid");
const modalProducto = document.getElementById("modalProducto");
const carritoPanel = document.getElementById("carritoPanel");

const modalImagen = document.getElementById("modalImagen");
const modalNombre = document.getElementById("modalNombre");
const modalDescripcion = document.getElementById("modalDescripcion");
const opcionesPizza = document.getElementById("opcionesPizza");
const listaTamanos = document.getElementById("listaTamanos");
const listaExtras = document.getElementById("listaExtras");
const cantidadProducto = document.getElementById("cantidadProducto");
const totalProducto = document.getElementById("totalProducto");
const notasProducto = document.getElementById("notasProducto");

function cargarProductos(categoria = "todos") {
  productosGrid.innerHTML = "";

  const productosFiltrados = categoria === "todos"
    ? productos
    : productos.filter(producto => producto.categoria === categoria);

  productosFiltrados.forEach(producto => {
    const precioMostrar = producto.categoria === "pizza"
      ? producto.precios.Chica
      : producto.precio;

    const card = document.createElement("div");
    card.className = "producto-card";

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="producto-info">
        <small>${producto.categoria}</small>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>

        <div class="producto-bottom">
          <strong>Desde $${precioMostrar}</strong>
          <button onclick="abrirProducto(${producto.id})">
            ${producto.categoria === "pizza" ? "Personalizar" : "Agregar"}
          </button>
        </div>
      </div>
    `;

    productosGrid.appendChild(card);
  });
}

function filtrarCategoria(categoria) {
  cargarProductos(categoria);

  document.querySelectorAll(".categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  event.target.classList.add("activo");
}

function abrirProducto(id) {
  productoSeleccionado = productos.find(producto => producto.id === id);
  cantidad = 1;

  modalImagen.src = productoSeleccionado.imagen;
  modalNombre.textContent = productoSeleccionado.nombre;
  modalDescripcion.textContent = productoSeleccionado.descripcion;
  cantidadProducto.textContent = cantidad;
  notasProducto.value = "";

  listaTamanos.innerHTML = "";
  listaExtras.innerHTML = "";

  if (productoSeleccionado.categoria === "pizza") {
    opcionesPizza.classList.remove("oculto");

    Object.entries(productoSeleccionado.precios).forEach(([tamano, precio], index) => {
      const label = document.createElement("label");

      label.innerHTML = `
        <input type="radio" name="tamano" value="${tamano}" data-precio="${precio}" ${index === 0 ? "checked" : ""}>
        ${tamano} - $${precio}
      `;

      listaTamanos.appendChild(label);
    });

    extras.forEach(extra => {
      const label = document.createElement("label");

      label.innerHTML = `
        <input type="checkbox" name="extra" value="${extra}" data-precio="10">
        ${extra} +$10
      `;

      listaExtras.appendChild(label);
    });

  } else {
    opcionesPizza.classList.add("oculto");
  }

  modalProducto.classList.remove("oculto");
  actualizarTotalProducto();

  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", actualizarTotalProducto);
  });
}

function cerrarModal() {
  modalProducto.classList.add("oculto");
}

function cambiarCantidad(valor) {
  cantidad += valor;

  if (cantidad < 1) {
    cantidad = 1;
  }

  cantidadProducto.textContent = cantidad;
  actualizarTotalProducto();
}

function obtenerPrecioBase() {
  if (productoSeleccionado.categoria === "pizza") {
    const tamanoSeleccionado = document.querySelector('input[name="tamano"]:checked');
    return Number(tamanoSeleccionado.dataset.precio);
  }

  return productoSeleccionado.precio;
}

function obtenerMasa() {
  if (productoSeleccionado.categoria !== "pizza") {
    return "";
  }

  const masaSeleccionada = document.querySelector('input[name="masa"]:checked');
  return masaSeleccionada.value;
}

function obtenerPrecioMasa() {
  const masa = obtenerMasa();

  if (masa.includes("+$35")) {
    return 35;
  }

  return 0;
}

function obtenerExtrasSeleccionados() {
  const extrasSeleccionados = [];

  document.querySelectorAll('input[name="extra"]:checked').forEach(extra => {
    extrasSeleccionados.push({
      nombre: extra.value,
      precio: Number(extra.dataset.precio)
    });
  });

  return extrasSeleccionados;
}

function actualizarTotalProducto() {
  if (!productoSeleccionado) return;

  let total = obtenerPrecioBase();

  if (productoSeleccionado.categoria === "pizza") {
    total += obtenerPrecioMasa();

    const extrasSeleccionados = obtenerExtrasSeleccionados();

    extrasSeleccionados.forEach(extra => {
      total += extra.precio;
    });
  }

  total = total * cantidad;

  totalProducto.textContent = total;
}

function agregarAlCarrito() {
  const precioBase = obtenerPrecioBase();
  const masa = obtenerMasa();
  const precioMasa = obtenerPrecioMasa();
  const extrasSeleccionados = obtenerExtrasSeleccionados();
  const notas = notasProducto.value.trim();

  let subtotalUnitario = precioBase + precioMasa;

  extrasSeleccionados.forEach(extra => {
    subtotalUnitario += extra.precio;
  });

  const subtotal = subtotalUnitario * cantidad;

  const item = {
    id: Date.now(),
    nombre: productoSeleccionado.nombre,
    categoria: productoSeleccionado.categoria,
    cantidad,
    precioBase,
    masa,
    precioMasa,
    extras: extrasSeleccionados,
    notas,
    subtotal
  };

  if (productoSeleccionado.categoria === "pizza") {
    const tamanoSeleccionado = document.querySelector('input[name="tamano"]:checked');
    item.tamano = tamanoSeleccionado.value;
  }

  carrito.push(item);

  cerrarModal();
  actualizarCarrito();
}

function actualizarCarrito() {
  const listaCarrito = document.getElementById("listaCarrito");
  const totalCarrito = document.getElementById("totalCarrito");
  const contadorCarrito = document.getElementById("contadorCarrito");

  listaCarrito.innerHTML = "";

  let total = 0;

  carrito.forEach(item => {
    total += item.subtotal;

    const div = document.createElement("div");
    div.className = "item-carrito";

    let detalles = "";

    if (item.categoria === "pizza") {
      detalles += `<p><strong>Tamaño:</strong> ${item.tamano}</p>`;
      detalles += `<p><strong>Masa:</strong> ${item.masa}</p>`;

      if (item.extras.length > 0) {
        detalles += `<p><strong>Extras:</strong> ${item.extras.map(extra => extra.nombre).join(", ")}</p>`;
      }
    }

    if (item.notas) {
      detalles += `<p><strong>Notas:</strong> ${item.notas}</p>`;
    }

    div.innerHTML = `
      <h3>${item.cantidad}x ${item.nombre}</h3>
      ${detalles}
      <strong>$${item.subtotal}</strong>
      <br><br>
      <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
    `;

    listaCarrito.appendChild(div);
  });

  totalCarrito.textContent = total;
  contadorCarrito.textContent = carrito.length;
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  actualizarCarrito();
}

function abrirCarrito() {
  carritoPanel.classList.remove("oculto");
  actualizarCarrito();
}

function cerrarCarrito() {
  carritoPanel.classList.add("oculto");
}

function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const nombre = document.getElementById("nombreCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();

  let mensaje = `Hola, quiero hacer un pedido:%0A%0A`;

  if (nombre) {
    mensaje += `Nombre: ${nombre}%0A`;
  }

  if (direccion) {
    mensaje += `Dirección: ${direccion}%0A`;
  }

  mensaje += `%0A--- Pedido ---%0A`;

  let total = 0;

  carrito.forEach((item, index) => {
    total += item.subtotal;

    mensaje += `%0A${index + 1}. ${item.cantidad}x ${item.nombre}%0A`;

    if (item.categoria === "pizza") {
      mensaje += `Tamaño: ${item.tamano}%0A`;
      mensaje += `Masa: ${item.masa}%0A`;

      if (item.extras.length > 0) {
        mensaje += `Extras: ${item.extras.map(extra => extra.nombre).join(", ")}%0A`;
      }
    }

    if (item.notas) {
      mensaje += `Notas: ${item.notas}%0A`;
    }

    mensaje += `Subtotal: $${item.subtotal}%0A`;
  });

  mensaje += `%0ATotal: $${total}`;

  const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

  window.open(url, "_blank");
}

cargarProductos();