(() => {
  "use strict";

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Visor de páginas interiores (<dialog> nativo)
     ------------------------------------------------------------------ */
  const visor = document.getElementById("visor");
  const visorImagen = document.getElementById("visor-imagen");
  const visorPie = document.getElementById("visor-pie");
  let origenVisor = null;

  document.querySelectorAll(".mirada").forEach((boton) => {
    boton.addEventListener("click", () => {
      origenVisor = boton;
      visorImagen.src = boton.dataset.src;
      visorImagen.alt = boton.dataset.alt;
      visorPie.textContent = boton.dataset.alt;
      visor.showModal();
    });
  });
  document.getElementById("visor-cerrar").addEventListener("click", () => visor.close());
  visor.addEventListener("click", (e) => {
    if (e.target === visor) visor.close();
  });
  visor.addEventListener("close", () => {
    visorImagen.removeAttribute("src");
    if (origenVisor) origenVisor.focus();
  });

  /* ------------------------------------------------------------------
     Frases: flechas para recorrer la fila
     ------------------------------------------------------------------ */
  const pista = document.getElementById("frases-pista");
  const mover = (sentido) => {
    const paso = Math.max(pista.clientWidth * 0.8, 280) * sentido;
    pista.scrollBy({ left: paso, behavior: sinMovimiento ? "auto" : "smooth" });
  };
  document.getElementById("frases-atras").addEventListener("click", () => mover(-1));
  document.getElementById("frases-adelante").addEventListener("click", () => mover(1));

  /* ------------------------------------------------------------------
     Respiración 4-4-4-4
     inhalá 4 s, sostené 4 s, exhalá 4 s, pausa 4 s. Cuatro vueltas.
     ------------------------------------------------------------------ */
  const boton = document.getElementById("aliento-boton");
  const disco = document.getElementById("aliento-disco");
  const fase = document.getElementById("aliento-fase");
  const cuenta = document.getElementById("aliento-cuenta");
  const vuelta = document.getElementById("aliento-vuelta");

  const ESCALA_MIN = 0.74; // debe coincidir con el scale() inicial de .aliento__disco
  const FASES = [
    { texto: "Inhalá", escala: 1, mueve: true },
    { texto: "Sostené", escala: 1, mueve: false },
    { texto: "Exhalá", escala: ESCALA_MIN, mueve: true },
    { texto: "Pausa", escala: ESCALA_MIN, mueve: false },
  ];
  const SEGUNDOS = 4;
  const VUELTAS = 4;

  let reloj = null;
  let paso = 0;
  let restante = SEGUNDOS;
  let vueltaActual = 1;

  function mostrarFase() {
    const f = FASES[paso];
    fase.textContent = f.texto;
    cuenta.textContent = restante;
    vuelta.textContent = `Vuelta ${vueltaActual} de ${VUELTAS}`;
    disco.style.transitionDuration = !sinMovimiento && f.mueve ? `${SEGUNDOS}s` : "0s";
    disco.style.transform = `scale(${f.escala})`;
  }

  function detener(mensaje) {
    clearInterval(reloj);
    reloj = null;
    boton.textContent = "Empezar a respirar";
    boton.setAttribute("aria-pressed", "false");
    disco.style.transitionDuration = sinMovimiento ? "0s" : "1.2s";
    disco.style.transform = `scale(${ESCALA_MIN})`;
    cuenta.textContent = "";
    vuelta.textContent = "";
    fase.textContent = mensaje;
  }

  function latido() {
    restante -= 1;
    if (restante > 0) {
      cuenta.textContent = restante;
      return;
    }
    paso += 1;
    if (paso === FASES.length) {
      paso = 0;
      vueltaActual += 1;
      if (vueltaActual > VUELTAS) {
        detener("Listo. ¿Cómo está tu cuerpo ahora?");
        return;
      }
    }
    restante = SEGUNDOS;
    mostrarFase();
  }

  function empezar() {
    paso = 0;
    restante = SEGUNDOS;
    vueltaActual = 1;
    boton.textContent = "Detener";
    boton.setAttribute("aria-pressed", "true");
    // el disco parte chico; la primera inhalación lo agranda
    disco.style.transitionDuration = "0s";
    disco.style.transform = `scale(${ESCALA_MIN})`;
    void disco.offsetWidth;
    mostrarFase();
    reloj = setInterval(latido, 1000);
  }

  boton.addEventListener("click", () => {
    if (reloj) detener("Listo para empezar");
    else empezar();
  });

  // Si la persona se va de la pestaña, se detiene para no desfasarse
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && reloj) detener("Listo para empezar");
  });
})();
