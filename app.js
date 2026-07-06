const numeroWhatsApp = "526621668765";

const RESTAURANTE_ID = "e96c7d56-9cbe-499e-9bd7-232e532b087e";

const params = new URLSearchParams(window.location.search);
const codigoMesa = params.get("mesa");

let mesaActual = null;

let carrito = [];
let productoSeleccionado = null;
let cantidad = 1;

const productosGrid = document.getElementById("productosGrid");
const categoriasMenu = document.getElementById("categoriasMenu");
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

function filtrarCategoria(categoria, boton) {
  cargarProductosDesdeSupabase(categoria);

  document.querySelectorAll(".categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");
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

function actualizarTotalProducto() {
  if (!productoSeleccionado) return;

  let total = Number(productoSeleccionado.precio) || 0;

  document.querySelectorAll("#opcionesPizza input:checked").forEach(input => {
    total += Number(input.dataset.precio) || 0;
  });

  total = total * cantidad;

  totalProducto.textContent = total;
}

function agregarAlCarrito() {
  const notas = notasProducto.value.trim();

  let subtotalUnitario = Number(productoSeleccionado.precio) || 0;
  const opcionesSeleccionadas = [];

  document.querySelectorAll("#opcionesPizza input:checked").forEach(input => {
    const precio = Number(input.dataset.precio) || 0;

    subtotalUnitario += precio;

    opcionesSeleccionadas.push({
      grupo: input.dataset.grupo,
      nombre: input.value,
      precio
    });
  });

  const subtotal = subtotalUnitario * cantidad;

  const item = {
    id: Date.now(),
    producto_id: productoSeleccionado.id,
    nombre: productoSeleccionado.nombre,
    categoria: productoSeleccionado.categoria,
    cantidad,
    precioBase: Number(productoSeleccionado.precio) || 0,
    opciones: opcionesSeleccionadas,
    notas,
    subtotal
  };

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

    if (item.opciones && item.opciones.length > 0) {
      detalles += `<p><strong>Opciones:</strong></p>`;

      item.opciones.forEach(opcion => {
        detalles += `
          <p>
            ${opcion.grupo}: ${opcion.nombre}
            ${opcion.precio > 0 ? `+$${opcion.precio}` : ""}
          </p>
        `;
      });
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

async function enviarPedidoPanel() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  if (!mesaActual) {
    alert("No se detectó la mesa. Escanea el QR de la mesa nuevamente.");
    return;
  }

  const nombre = document.getElementById("nombreCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const { data: pedido, error } = await supabaseClient
    .from("pedidos")
    .insert({
      restaurante_id: RESTAURANTE_ID,
      mesa_id: mesaActual.id,
      mesa_nombre: mesaActual.nombre,
      cliente_nombre: nombre || null,
      notas: direccion || null,
      total: total,
      estado: "nuevo"
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Error al enviar pedido");
    return;
  }

  const items = carrito.map(item => ({
    pedido_id: pedido.id,
    producto_nombre: item.nombre,
    tamano: item.opciones?.find(op => op.grupo === "Tamaño")?.nombre || "",
    cantidad: item.cantidad,
    precio_unitario: item.precioBase,
    extras: item.opciones || [],
    subtotal: item.subtotal
  }));

  const { error: errorItems } = await supabaseClient
    .from("pedido_items")
    .insert(items);

  if (errorItems) {
    console.error(errorItems);
    alert("El pedido se creó, pero hubo error al guardar productos");
    return;
  }

carrito = [];
actualizarCarrito();
cerrarCarrito();

setTimeout(() => {
  mostrarPopupExito(`Tu pedido fue enviado correctamente desde ${mesaActual.nombre}.`);
}, 200);
}

document.addEventListener("DOMContentLoaded", () => {
  detectarMesa();
  cargarCategoriasMenu();
  cargarProductosDesdeSupabase();
});
async function cargarProductosDesdeSupabase(categoria = "todos") {
  productosGrid.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("productos")
    .select(`
      *,
      categorias(nombre)
    `)
    .eq("restaurante_id", RESTAURANTE_ID)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    productosGrid.innerHTML = "<p>Error al cargar productos.</p>";
    return;
  }

  let productosFiltrados = data;

  if (categoria !== "todos") {
    productosFiltrados = data.filter(producto => {
      const nombreCategoria = producto.categorias?.nombre?.toLowerCase() || "";
      return nombreCategoria.includes(categoria);
    });
  }

  productosFiltrados.forEach(producto => {
    const categoriaNombre = producto.categorias?.nombre || "Menú";

    const card = document.createElement("div");
    card.className = "producto-card";

    card.innerHTML = `
      <img src="${producto.imagen_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=900'}" alt="${producto.nombre}">

      <div class="producto-info">
        <small>🔥 ${categoriaNombre}</small>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || ""}</p>

        <div class="producto-bottom">
          <strong>$${producto.precio_base}</strong>
          <button onclick="abrirProductoSupabase('${producto.id}')">
            Agregar
          </button>
        </div>
      </div>
    `;

    productosGrid.appendChild(card);
  });
}

async function abrirProductoSupabase(id) {
  const { data: producto, error } = await supabaseClient
    .from("productos")
    .select(`
      *,
      categorias(nombre),
      producto_opciones_grupos(
        *,
        producto_opciones(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("Error al abrir producto");
    return;
  }

  productoSeleccionado = {
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categorias?.nombre?.toLowerCase() || "menu",
    descripcion: producto.descripcion || "",
    imagen: producto.imagen_url || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=900",
    precio: Number(producto.precio_base) || 0,
    grupos: producto.producto_opciones_grupos || []
  };

  cantidad = 1;

  modalImagen.src = productoSeleccionado.imagen;
  modalNombre.textContent = productoSeleccionado.nombre;
  modalDescripcion.textContent = productoSeleccionado.descripcion;
  cantidadProducto.textContent = cantidad;
  notasProducto.value = "";

  renderOpcionesDinamicas(productoSeleccionado.grupos);

  modalProducto.classList.remove("oculto");
  actualizarTotalProducto();
}

function renderOpcionesDinamicas(grupos) {
  opcionesPizza.innerHTML = "";

  if (!grupos || grupos.length === 0) {
    opcionesPizza.classList.add("oculto");
    return;
  }

  opcionesPizza.classList.remove("oculto");

  grupos.forEach(grupo => {
    const opcionesActivas = grupo.producto_opciones.filter(opcion => opcion.activo);

    let opcionesHTML = "";

    opcionesActivas.forEach((opcion, index) => {
      const checked = grupo.tipo === "radio" && index === 0 ? "checked" : "";

      opcionesHTML += `
        <label>
          <input 
            type="${grupo.tipo}" 
            name="grupo_${grupo.id}" 
            value="${opcion.nombre}"
            data-precio="${opcion.precio}"
            data-grupo="${grupo.nombre}"
            ${checked}
          >
          <span>${opcion.nombre}</span>
          <strong>${Number(opcion.precio) > 0 ? `+$${opcion.precio}` : "Incluido"}</strong>
        </label>
      `;
    });

    opcionesPizza.innerHTML += `
      <div class="grupo-opciones">
        <h3>${grupo.nombre}</h3>
        <div class="${grupo.tipo === "checkbox" ? "extras-grid" : "option-list"}">
          ${opcionesHTML}
        </div>
      </div>
    `;
  });

  document.querySelectorAll("#opcionesPizza input").forEach(input => {
    input.addEventListener("change", actualizarTotalProducto);
  });
}

async function detectarMesa() {
  if (!codigoMesa) {
    console.warn("No se encontró mesa en la URL");
    return;
  }

  const { data, error } = await supabaseClient
    .from("mesas")
    .select("*")
    .eq("codigo_mesa", codigoMesa)
    .single();

  if (error || !data) {
    console.error("Mesa no encontrada:", error);
    return;
  }

  mesaActual = data;
  console.log("Mesa detectada:", mesaActual.nombre);
}

async function cargarCategoriasMenu() {
  const { data, error } = await supabaseClient
    .from("categorias")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .eq("activo", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  categoriasMenu.innerHTML = `
    <button onclick="filtrarCategoria('todos', this)" class="activo">
      Todo
    </button>
  `;

  data.forEach(categoria => {
    categoriasMenu.innerHTML += `
      <button onclick="filtrarCategoria('${categoria.nombre.toLowerCase()}', this)">
        ${categoria.nombre}
      </button>
    `;
  });
}

function mostrarPopupExito(mensaje) {
  const popup = document.getElementById("popupExito");
  const popupMensaje = document.getElementById("popupMensaje");

  popupMensaje.textContent = mensaje;
  popup.classList.remove("oculto");
}

function cerrarPopupExito() {
  document.getElementById("popupExito").classList.add("oculto");
}