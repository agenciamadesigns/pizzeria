const RESTAURANTE_ID = "e96c7d56-9cbe-499e-9bd7-232e532b087e";

// CATEGORÍAS
const formCategoria = document.getElementById("formCategoria");
const nombreCategoria = document.getElementById("nombreCategoria");
const listaCategorias = document.getElementById("listaCategorias");

// PRODUCTOS
const formProducto = document.getElementById("formProducto");
const nombreProducto = document.getElementById("nombreProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const precioProducto = document.getElementById("precioProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const imagenProducto = document.getElementById("imagenProducto");
const listaProductos = document.getElementById("listaProductos");
const tieneVariantes = document.getElementById("tieneVariantes");
const bloqueVariantes = document.getElementById("bloqueVariantes");
const listaTamanosAdmin = document.getElementById("listaTamanosAdmin");
const listaMasasAdmin = document.getElementById("listaMasasAdmin");
const listaExtrasAdmin = document.getElementById("listaExtrasAdmin");
let productoEditandoId = null;

// MESAS
const formMesa = document.getElementById("formMesa");
const nombreMesa = document.getElementById("nombreMesa");
const listaMesas = document.getElementById("listaMesas");

// PEDIDOS
const listaPedidos = document.getElementById("listaPedidos");

document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  cargarProductos();
  cargarMesas();
  cargarPedidos();
  escucharPedidosRealtime();
});

// ==========================
// CATEGORÍAS
// ==========================

formCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreCategoria.value.trim();

  if (!nombre) {
    alert("Escribe el nombre de la categoría");
    return;
  }

  const { error } = await supabaseClient
    .from("categorias")
    .insert({
      restaurante_id: RESTAURANTE_ID,
      nombre: nombre,
      activo: true
    });

  if (error) {
    console.error(error);
    alert("Error al guardar categoría");
    return;
  }

  formCategoria.reset();
  cargarCategorias();
});

async function cargarCategorias() {
  const { data, error } = await supabaseClient
    .from("categorias")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  listaCategorias.innerHTML = "";
  categoriaProducto.innerHTML = `<option value="">Selecciona categoría</option>`;

  data.forEach(cat => {
    listaCategorias.innerHTML += `
      <div class="admin-card">
        <h3>${cat.nombre}</h3>
        <p>Estado: ${cat.activo ? "Activa" : "Inactiva"}</p>

        <button onclick="cambiarEstadoCategoria('${cat.id}', ${cat.activo})">
          ${cat.activo ? "Desactivar" : "Activar"}
        </button>

        <button onclick="eliminarCategoria('${cat.id}')">
          Eliminar
        </button>
      </div>
    `;

    if (cat.activo) {
      categoriaProducto.innerHTML += `
        <option value="${cat.id}">${cat.nombre}</option>
      `;
    }
  });
}

async function cambiarEstadoCategoria(id, activoActual) {
  const { error } = await supabaseClient
    .from("categorias")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al actualizar categoría");
    return;
  }

  cargarCategorias();
}

async function eliminarCategoria(id) {
  if (!confirm("¿Eliminar esta categoría?")) return;

  const { error } = await supabaseClient
    .from("categorias")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar categoría");
    return;
  }

  cargarCategorias();
}

// ==========================
// PRODUCTOS
// ==========================

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreProducto.value.trim();
  const descripcion = descripcionProducto.value.trim();
  const precio = Number(precioProducto.value) || 0;
  const categoria_id = categoriaProducto.value;
  const archivoImagen = imagenProducto.files[0];

  if (!nombre || !categoria_id) {
    alert("Completa nombre y categoría");
    return;
  }

  let imagenUrl = "";

  if (archivoImagen) {
    const extension = archivoImagen.name.split(".").pop();
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
    const rutaArchivo = `productos/${nombreArchivo}`;

    const { error: errorUpload } = await supabaseClient.storage
      .from("productos")
      .upload(rutaArchivo, archivoImagen);

    if (errorUpload) {
      console.error(errorUpload);
      alert("Error al subir la imagen");
      return;
    }

    const { data: publicData } = supabaseClient.storage
      .from("productos")
      .getPublicUrl(rutaArchivo);

    imagenUrl = publicData.publicUrl;
  }

  const variantes = obtenerVariantesDelFormulario();

const datosProducto = {
  restaurante_id: RESTAURANTE_ID,
  categoria_id: categoria_id,
  nombre: nombre,
  descripcion: descripcion,
  precio_base: precio,
  activo: true
};

if (imagenUrl) {
  datosProducto.imagen_url = imagenUrl;
}

let productoGuardado;
let error;

if (productoEditandoId) {
  const respuesta = await supabaseClient
    .from("productos")
    .update(datosProducto)
    .eq("id", productoEditandoId)
    .select()
    .single();

  productoGuardado = respuesta.data;
  error = respuesta.error;
} else {
  const respuesta = await supabaseClient
    .from("productos")
    .insert(datosProducto)
    .select()
    .single();

  productoGuardado = respuesta.data;
  error = respuesta.error;
}

  if (error) {
    console.error(error);
    alert("Error al guardar producto");
    return;
  }

  if (productoEditandoId) {
  const { error: errorBorrarVariantes } = await supabaseClient
    .from("producto_opciones_grupos")
    .delete()
    .eq("producto_id", productoGuardado.id);

  if (errorBorrarVariantes) {
    console.error(errorBorrarVariantes);
    alert("Producto actualizado, pero hubo error al borrar variantes anteriores");
    return;
  }
}

  for (const grupo of variantes) {
    const { data: grupoGuardado, error: errorGrupo } = await supabaseClient
      .from("producto_opciones_grupos")
      .insert({
        producto_id: productoGuardado.id,
        nombre: grupo.nombre,
        tipo: grupo.tipo,
        obligatorio: grupo.obligatorio,
        activo: true
      })
      .select()
      .single();

    if (errorGrupo) {
      console.error(errorGrupo);
      alert("El producto se guardó, pero hubo error al guardar variantes");
      return;
    }

    const opcionesInsert = grupo.opciones.map(opcion => ({
      grupo_id: grupoGuardado.id,
      nombre: opcion.nombre,
      precio: opcion.precio,
      activo: true
    }));

    const { error: errorOpciones } = await supabaseClient
      .from("producto_opciones")
      .insert(opcionesInsert);

    if (errorOpciones) {
      console.error(errorOpciones);
      alert("El producto se guardó, pero hubo error al guardar opciones");
      return;
    }
  }

    alert(productoEditandoId ? "Producto actualizado correctamente" : "Producto guardado correctamente");

    productoEditandoId = null;
    formProducto.querySelector("button[type='submit']").textContent = "Guardar producto";

  formProducto.reset();
  bloqueVariantes.classList.add("oculto");
  listaTamanosAdmin.innerHTML = "";
  listaMasasAdmin.innerHTML = "";
  listaExtrasAdmin.innerHTML = "";

  cargarProductos();
});

async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select(`
      *,
      categorias(nombre)
    `)
    .eq("restaurante_id", RESTAURANTE_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  listaProductos.innerHTML = "";

  data.forEach(prod => {
    listaProductos.innerHTML += `
      <div class="admin-card">
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion || ""}</p>
        <p>Categoría: ${prod.categorias?.nombre || "Sin categoría"}</p>
        <p>Precio: $${prod.precio_base}</p>
        <p>Estado: ${prod.activo ? "Activo" : "Inactivo"}</p>

        <button onclick="editarProducto('${prod.id}')">
        Editar
        </button>

        <button onclick="cambiarEstadoProducto('${prod.id}', ${prod.activo})">
          ${prod.activo ? "Desactivar" : "Activar"}
        </button>

        <button onclick="eliminarProducto('${prod.id}')">
          Eliminar
        </button>
      </div>
    `;
  });
}

async function cambiarEstadoProducto(id, activoActual) {
  const { error } = await supabaseClient
    .from("productos")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al actualizar producto");
    return;
  }

  cargarProductos();
}

async function eliminarProducto(id) {
  if (!confirm("¿Eliminar producto?")) return;

  const { error } = await supabaseClient
    .from("productos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar producto");
    return;
  }

  cargarProductos();
}

// ==========================
// MESAS Y QR
// ==========================

formMesa.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreMesa.value.trim();

  if (!nombre) {
    alert("Escribe el nombre de la mesa");
    return;
  }

  const codigoMesa = "MESA-" + Date.now();

  const { error } = await supabaseClient
    .from("mesas")
    .insert({
      restaurante_id: RESTAURANTE_ID,
      nombre: nombre,
      codigo_mesa: codigoMesa,
      activo: true
    });

  if (error) {
    console.error(error);
    alert("Error al crear mesa");
    return;
  }

  formMesa.reset();
  cargarMesas();
});

async function cargarMesas() {
  const { data, error } = await supabaseClient
    .from("mesas")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  listaMesas.innerHTML = "";

  data.forEach(mesa => {
    const urlMenu = `${window.location.origin}${window.location.pathname.replace("admin.html", "index.html")}?mesa=${mesa.codigo_mesa}`;
    const qrId = `qr-${mesa.id}`;

    listaMesas.innerHTML += `
      <div class="admin-card">
        <h3>${mesa.nombre}</h3>
        <p>Código: ${mesa.codigo_mesa}</p>
        <p>URL: ${urlMenu}</p>

        <div class="qr-box" id="${qrId}"></div>

        <br><br>

        <button onclick="eliminarMesa('${mesa.id}')">
          Eliminar mesa
        </button>
      </div>
    `;

    setTimeout(() => {
      const qrDiv = document.getElementById(qrId);
      if (qrDiv) {
        qrDiv.innerHTML = "";
        new QRCode(qrDiv, {
          text: urlMenu,
          width: 160,
          height: 160
        });
      }
    }, 100);
  });
}

async function eliminarMesa(id) {
  if (!confirm("¿Eliminar mesa?")) return;

  const { error } = await supabaseClient
    .from("mesas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar mesa");
    return;
  }

  cargarMesas();
}

// ==========================
// PEDIDOS
// ==========================

async function cargarPedidos() {
  const { data, error } = await supabaseClient
    .from("pedidos")
    .select(`
      *,
      pedido_items(*)
    `)
    .eq("restaurante_id", RESTAURANTE_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  listaPedidos.innerHTML = "";

  data.forEach(pedido => {
    let itemsHTML = "";

    if (pedido.pedido_items) {
      pedido.pedido_items.forEach(item => {
        itemsHTML += `
          <li>
            ${item.cantidad}x ${item.producto_nombre}
            ${item.tamano ? "- " + item.tamano : ""}
            - $${item.subtotal}
          </li>
        `;
      });
    }

    listaPedidos.innerHTML += `
      <div class="admin-card pedido-card estado-${pedido.estado}">
        <h3>${pedido.mesa_nombre || "Sin mesa"}</h3>
        <p>Estado: <strong>${pedido.estado}</strong></p>
        <p>Total: <strong>$${pedido.total}</strong></p>
        <p>Cliente: ${pedido.cliente_nombre || "Sin nombre"}</p>
        <p>Notas: ${pedido.notas || "Sin notas"}</p>

        <ul>${itemsHTML}</ul>

        <button onclick="cambiarEstadoPedido('${pedido.id}', 'preparando')">
          Preparando
        </button>

        <button onclick="cambiarEstadoPedido('${pedido.id}', 'listo')">
          Listo
        </button>

        <button onclick="cambiarEstadoPedido('${pedido.id}', 'entregado')">
          Entregado
        </button>
      </div>
    `;
  });
}

async function cambiarEstadoPedido(id, estado) {
  const { error } = await supabaseClient
    .from("pedidos")
    .update({ estado })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al cambiar estado");
    return;
  }

  cargarPedidos();
}

function escucharPedidosRealtime() {
  supabaseClient
    .channel("pedidos-restaurante")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pedidos",
        filter: `restaurante_id=eq.${RESTAURANTE_ID}`
      },
      (payload) => {
        console.log("Cambio en pedidos:", payload);

        cargarPedidos();

        if (payload.eventType === "INSERT") {
          reproducirSonidoPedido();
          mostrarAlertaPedido("Nuevo pedido recibido");
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime pedidos:", status);
    });
}

function reproducirSonidoPedido() {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  audio.play().catch(() => {});
}

tieneVariantes.addEventListener("change", () => {
  if (tieneVariantes.checked) {
    bloqueVariantes.classList.remove("oculto");

    if (listaTamanosAdmin.children.length === 0) {
      agregarFilaVariante("tamano");
      agregarFilaVariante("masa");
      agregarFilaVariante("extra");
    }
  } else {
    bloqueVariantes.classList.add("oculto");
  }
});

function agregarFilaVariante(tipo) {
  const div = document.createElement("div");
  div.className = "fila-variante";

  div.innerHTML = `
    <input type="text" placeholder="Nombre" class="variante-nombre">
    <input type="number" placeholder="Precio" class="variante-precio">
    <button type="button" onclick="this.parentElement.remove()">×</button>
  `;

  if (tipo === "tamano") {
    listaTamanosAdmin.appendChild(div);
  }

  if (tipo === "masa") {
    listaMasasAdmin.appendChild(div);
  }

  if (tipo === "extra") {
    listaExtrasAdmin.appendChild(div);
  }
}

function obtenerVariantesDelFormulario() {
  const variantes = [];

  if (!tieneVariantes.checked) {
    return variantes;
  }

  const grupos = [
    {
      nombre: "Tamaño",
      tipo: "radio",
      obligatorio: true,
      contenedor: listaTamanosAdmin
    },
    {
      nombre: "Masa",
      tipo: "radio",
      obligatorio: true,
      contenedor: listaMasasAdmin
    },
    {
      nombre: "Ingredientes extra",
      tipo: "checkbox",
      obligatorio: false,
      contenedor: listaExtrasAdmin
    }
  ];

  grupos.forEach(grupo => {
    const opciones = [];

    grupo.contenedor.querySelectorAll(".fila-variante").forEach(fila => {
      const nombre = fila.querySelector(".variante-nombre").value.trim();
      const precio = Number(fila.querySelector(".variante-precio").value) || 0;

      if (nombre) {
        opciones.push({
          nombre,
          precio
        });
      }
    });

    if (opciones.length > 0) {
      variantes.push({
        nombre: grupo.nombre,
        tipo: grupo.tipo,
        obligatorio: grupo.obligatorio,
        opciones
      });
    }
  });

  return variantes;
}

async function editarProducto(id) {
  const { data: producto, error } = await supabaseClient
    .from("productos")
    .select(`
      *,
      producto_opciones_grupos(
        *,
        producto_opciones(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("Error al cargar producto");
    return;
  }

  productoEditandoId = producto.id;

  nombreProducto.value = producto.nombre || "";
  descripcionProducto.value = producto.descripcion || "";
  precioProducto.value = producto.precio_base || 0;
  categoriaProducto.value = producto.categoria_id || "";

  listaTamanosAdmin.innerHTML = "";
  listaMasasAdmin.innerHTML = "";
  listaExtrasAdmin.innerHTML = "";

  const grupos = producto.producto_opciones_grupos || [];

  if (grupos.length > 0) {
    tieneVariantes.checked = true;
    bloqueVariantes.classList.remove("oculto");

    grupos.forEach(grupo => {
      const nombreGrupo = grupo.nombre.toLowerCase();
      const opciones = grupo.producto_opciones || [];

      opciones.forEach(opcion => {
        if (nombreGrupo.includes("tamaño")) {
          agregarFilaVarianteConDatos("tamano", opcion.nombre, opcion.precio);
        }

        if (nombreGrupo.includes("masa")) {
          agregarFilaVarianteConDatos("masa", opcion.nombre, opcion.precio);
        }

        if (nombreGrupo.includes("ingrediente") || nombreGrupo.includes("extra")) {
          agregarFilaVarianteConDatos("extra", opcion.nombre, opcion.precio);
        }
      });
    });
  } else {
    tieneVariantes.checked = false;
    bloqueVariantes.classList.add("oculto");
  }

  formProducto.querySelector("button[type='submit']").textContent = "Actualizar producto";

  window.scrollTo({
    top: formProducto.offsetTop - 80,
    behavior: "smooth"
  });
}

function agregarFilaVarianteConDatos(tipo, nombre, precio) {
  agregarFilaVariante(tipo);

  let contenedor;

  if (tipo === "tamano") contenedor = listaTamanosAdmin;
  if (tipo === "masa") contenedor = listaMasasAdmin;
  if (tipo === "extra") contenedor = listaExtrasAdmin;

  const fila = contenedor.lastElementChild;

  fila.querySelector(".variante-nombre").value = nombre;
  fila.querySelector(".variante-precio").value = precio;
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;

    document.querySelectorAll(".nav-btn").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");

    document.querySelectorAll(".panel-section").forEach(sec => {
      sec.classList.remove("activa");
    });

    document.getElementById(`section-${section}`).classList.add("activa");
  });
});

function mostrarAlertaPedido(texto) {
  const alerta = document.createElement("div");
  alerta.className = "alerta-pedido";
  alerta.textContent = texto;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.remove();
  }, 3500);
}