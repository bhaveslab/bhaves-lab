export interface MeridianCopy {
  header: { chatButton: string };
  hero: {
    eyebrow: string;
    h1Part1: string;
    h1Part2: string;
    paragraph: string;
    ctaButton: string;
    seeMore: string;
  };
  traits: { title: string; body: string }[];
  buildKinds: { eyebrow: string; title: string; body: string }[];
  servicesHeading: { eyebrow: string; title: string };
  services: { title: string; body: string }[];
  processHeading: { eyebrow: string; title: string };
  processSteps: { num: string; label: string; desc: string }[];
  buildsHeading: { eyebrow: string; title: string; intro: string };
  // statusKind drives the gold-vs-muted label styling; status is the
  // translated display text, kept separate so the styling logic never has
  // to compare against language-specific strings.
  exampleBuilds: { status: string; statusKind: 'delivered' | 'in-build'; title: string; body: string }[];
  pricingHeading: { eyebrow: string; title: string };
  pricingTiers: { eyebrow: string; title: string; body: string }[];
  closing: { title: string; paragraph: string; button: string };
  footer: { tagline: string; suffix: string };
  chatIntake: {
    step1: { heading: string; subtext: string; namePlaceholder: string; emailPlaceholder: string };
    step2: { heading: string; subtext: string; options: string[] };
    step3: { heading: string; subtext: string; phoneLabel: string; phonePlaceholder: string };
    back: string;
    continue: string;
    sending: string;
    send: string;
    successTitle: string;
    successBody: string;
    errorTitle: string;
    errorBody: string;
  };
}

const en: MeridianCopy = {
  header: { chatButton: 'Chat with an expert' },
  hero: {
    eyebrow: 'Custom software & hardware builds',
    h1Part1: 'Every build starts as open space.',
    h1Part2: 'We build the structure inside it.',
    paragraph:
      'Meridian is the build arm of Bhavé’s Lab — the team that designs and ships software and physical systems businesses can’t buy off the shelf. We scope the actual problem, build the infrastructure to solve it, and hand you full ownership when it’s done.',
    ctaButton: 'Chat with an expert',
    seeMore: 'See what we build ↓',
  },
  traits: [
    { title: 'Client-owned', body: 'Every account, repo, and server lives in infrastructure you control from day one.' },
    { title: 'Tiered, transparent pricing', body: 'Personal, business, and web builds each start at a clear price point — no scoping call required to know where you stand.' },
    { title: 'Software + hardware', body: 'One team for the code and the physical system it runs on.' },
    { title: 'A Bhavé’s Lab company', body: 'The same team and standards behind the Lab’s own product line.' },
  ],
  buildKinds: [
    { eyebrow: 'SOFTWARE', title: 'Infrastructure, then interface', body: 'The systems behind it, built before what you see.' },
    { eyebrow: 'PHYSICAL ANCHORS', title: 'Containers that hold a system in place', body: 'Physical pieces the software interacts with.' },
    { eyebrow: 'COHERENCE', title: 'One system', body: 'Front face and underneath, wired the same way.' },
  ],
  servicesHeading: { eyebrow: 'Services', title: 'What we build, specifically.' },
  services: [
    { title: 'Custom software', body: 'Full applications built around what you actually run — not a template with your logo on it.' },
    { title: 'Hardware & physical systems', body: 'Devices, sensors, and kiosks wired to talk to the software behind them.' },
    { title: 'Web architecture', body: 'From a single fast page to a full interactive build with its own 3D layer.' },
    { title: 'Business operating systems', body: 'Booking, dispatch, ordering, and client management, built around one specific business — not a shared platform.' },
    { title: 'Personal & family systems', body: 'Private tools built for one household. Nobody else uses your version.' },
    { title: 'Post-launch support', body: 'We stay attached to what we build. Changes go through the team that built it, not a new vendor.' },
  ],
  processHeading: { eyebrow: 'How it goes', title: 'From a rough idea to infrastructure that’s actually yours.' },
  processSteps: [
    { num: '01', label: 'Scope', desc: 'We turn a rough direction into a scoped build — real constraints, real tradeoffs, no filler discovery decks.' },
    { num: '02', label: 'Architect the system', desc: 'Software, hardware, or both — we make the structural decisions early, so nothing you build later gets stuck rebuilding the foundation.' },
    { num: '03', label: 'Build in the open', desc: 'You see working versions early and often — not a status deck, the actual thing, running.' },
    { num: '04', label: 'Hand you the keys', desc: 'Every account, every server, every repository is yours from the first commit. We build it. You own it. No exceptions.' },
  ],
  buildsHeading: {
    eyebrow: 'Our own builds',
    title: 'What we build for ourselves first.',
    intro: 'Before a system goes to a client, we run it ourselves. Below is what we operate directly, alongside work we’ve delivered.',
  },
  exampleBuilds: [
    { status: 'DELIVERED', statusKind: 'delivered', title: 'WLV — Honduras', body: 'A full operating system built and delivered for a client in Honduras. One of our first proofs of what we build in Central America.' },
    { status: 'IN BUILD', statusKind: 'in-build', title: 'Kitchen ordering system', body: 'Menu architecture, table management, and direct guest ordering for a restaurant floor.' },
    { status: 'IN BUILD', statusKind: 'in-build', title: 'Taxi Direct', body: 'Direct dispatch and ride booking, built to run without a third-party platform in between.' },
    { status: 'IN BUILD', statusKind: 'in-build', title: 'Fleet dispatch', body: 'Direct dispatch, rider tracking, and driver status for a transport network.' },
  ],
  pricingHeading: { eyebrow: 'Pricing', title: 'Three starting points.' },
  pricingTiers: [
    { eyebrow: 'Starting at $250', title: 'Personal & Family', body: 'A private app for your household: shared chores and goals tracked in real time, encrypted journaling, and an offline-capable family directory. Built once, yours outright.' },
    { eyebrow: 'Starting at $750', title: 'Business Suites', body: 'Booking, ordering, and dispatch built for how your business actually runs — salons, restaurants, transport fleets. Client history, scheduling, and real-time status in one system you own.' },
    { eyebrow: 'Starting at $1,200', title: 'Web Architecture', body: 'From a single fast landing page to a full interactive build with its own 3D layer. One-Page ($1,200), Tri-Page ($2,000), Five-Page Suite ($3,000), Apex Build ($5,000+).' },
  ],
  closing: {
    title: 'Tell us what you’re trying to build.',
    paragraph: 'Personal builds start at $250. Business builds start at $750. Web builds start at $1,200. Thirty minutes tells us the right starting point for yours.',
    button: 'Chat with an expert',
  },
  footer: { tagline: 'Meridian is a', suffix: ' company' },
  chatIntake: {
    step1: {
      heading: 'Who are we talking to?',
      subtext: 'Your name and email — so we know who’s reaching out.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'you@company.com',
    },
    step2: {
      heading: 'What are you building?',
      subtext: 'Rough shape is fine — we’ll get specific on the call.',
      options: ['Software', 'Hardware', 'Both / not sure yet'],
    },
    step3: {
      heading: 'Anything else worth knowing?',
      subtext: 'Optional — timeline, constraints, what’s already built.',
      phoneLabel: 'Phone (optional) — if you’d rather we call.',
      phonePlaceholder: '(555) 000-0000',
    },
    back: 'Back',
    continue: 'Continue',
    sending: 'Sending…',
    send: 'Send',
    successTitle: 'Got it.',
    successBody: 'We’ll reply from info@meridiangtn.com within a day.',
    errorTitle: 'Couldn’t send that.',
    errorBody: 'Email us directly and we’ll pick it up from there.',
  },
};

const es: MeridianCopy = {
  header: { chatButton: 'Hablar con un experto' },
  hero: {
    eyebrow: 'Software y hardware a medida',
    h1Part1: 'Cada proyecto empieza como un espacio abierto.',
    h1Part2: 'Nosotros construimos la estructura dentro de él.',
    paragraph:
      'Meridian es el brazo de construcción de Bhavé’s Lab — el equipo que diseña y entrega software y sistemas físicos que las empresas no pueden comprar ya hechos. Definimos el problema real, construimos la infraestructura para resolverlo, y le entregamos la propiedad completa cuando está terminado.',
    ctaButton: 'Hablar con un experto',
    seeMore: 'Ver lo que construimos ↓',
  },
  traits: [
    { title: 'Propiedad del cliente', body: 'Cada cuenta, repositorio y servidor vive en infraestructura que usted controla desde el primer día.' },
    { title: 'Precios claros y por niveles', body: 'Los proyectos personales, de negocio y web tienen un precio de entrada claro — no necesita una llamada para saber dónde está parado.' },
    { title: 'Software + hardware', body: 'Un solo equipo para el código y el sistema físico donde corre.' },
    { title: 'Una empresa de Bhavé’s Lab', body: 'El mismo equipo y los mismos estándares detrás de la línea de productos del Lab.' },
  ],
  buildKinds: [
    { eyebrow: 'SOFTWARE', title: 'Infraestructura, luego interfaz', body: 'Los sistemas detrás, construidos antes de lo que usted ve.' },
    { eyebrow: 'ANCLAS FÍSICAS', title: 'Contenedores que mantienen un sistema en su lugar', body: 'Piezas físicas con las que interactúa el software.' },
    { eyebrow: 'COHERENCIA', title: 'Un solo sistema', body: 'La cara visible y lo de adentro, conectados de la misma manera.' },
  ],
  servicesHeading: { eyebrow: 'Servicios', title: 'Lo que construimos, en concreto.' },
  services: [
    { title: 'Software a medida', body: 'Aplicaciones completas construidas alrededor de cómo realmente opera su negocio — no una plantilla con su logo pegado.' },
    { title: 'Hardware y sistemas físicos', body: 'Dispositivos, sensores y kioscos conectados para comunicarse con el software detrás de ellos.' },
    { title: 'Arquitectura web', body: 'Desde una sola página rápida hasta un proyecto interactivo completo con su propia capa 3D.' },
    { title: 'Sistemas operativos de negocio', body: 'Reservas, despacho, pedidos y gestión de clientes, construidos alrededor de un negocio específico — no una plataforma compartida.' },
    { title: 'Sistemas personales y familiares', body: 'Herramientas privadas construidas para un solo hogar. Nadie más usa su versión.' },
    { title: 'Soporte después del lanzamiento', body: 'Seguimos conectados a lo que construimos. Los cambios pasan por el mismo equipo que lo construyó, no por un proveedor nuevo.' },
  ],
  processHeading: { eyebrow: 'Cómo funciona', title: 'De una idea aproximada a infraestructura que es realmente suya.' },
  processSteps: [
    { num: '01', label: 'Definir el alcance', desc: 'Convertimos una dirección aproximada en un proyecto definido — restricciones reales, decisiones reales, sin presentaciones de relleno.' },
    { num: '02', label: 'Diseñar la arquitectura del sistema', desc: 'Software, hardware, o ambos — tomamos las decisiones estructurales temprano, para que nada de lo que construya después se quede atascado reconstruyendo la base.' },
    { num: '03', label: 'Construir a la vista', desc: 'Usted ve versiones funcionando desde temprano y con frecuencia — no una presentación de estado, la cosa real, funcionando.' },
    { num: '04', label: 'Entregarle las llaves', desc: 'Cada cuenta, cada servidor, cada repositorio es suyo desde el primer commit. Nosotros lo construimos. Usted es dueño. Sin excepciones.' },
  ],
  buildsHeading: {
    eyebrow: 'Nuestros propios proyectos',
    title: 'Lo que construimos primero para nosotros mismos.',
    intro: 'Antes de que un sistema llegue a un cliente, lo operamos nosotros mismos. Abajo está lo que operamos directamente, junto con trabajo que ya hemos entregado.',
  },
  exampleBuilds: [
    { status: 'ENTREGADO', statusKind: 'delivered', title: 'WLV — Honduras', body: 'Un sistema operativo completo construido y entregado para un cliente en Honduras. Una de nuestras primeras pruebas de lo que construimos en Centroamérica.' },
    { status: 'EN CONSTRUCCIÓN', statusKind: 'in-build', title: 'Sistema de pedidos para cocina', body: 'Arquitectura de menú, gestión de mesas y pedidos directos de los comensales para el salón de un restaurante.' },
    { status: 'EN CONSTRUCCIÓN', statusKind: 'in-build', title: 'Taxi Direct', body: 'Despacho directo y reserva de viajes, construido para funcionar sin una plataforma externa de por medio.' },
    { status: 'EN CONSTRUCCIÓN', statusKind: 'in-build', title: 'Despacho de flota', body: 'Despacho directo, seguimiento de pasajeros y estado de los conductores para una red de transporte.' },
  ],
  pricingHeading: { eyebrow: 'Precios', title: 'Tres puntos de partida.' },
  pricingTiers: [
    { eyebrow: 'Desde $250', title: 'Personal y familiar', body: 'Una aplicación privada para su hogar: tareas y metas compartidas con seguimiento en tiempo real, diario encriptado, y un directorio familiar que funciona sin conexión. Se construye una vez, es completamente suya.' },
    { eyebrow: 'Desde $750', title: 'Suites de negocio', body: 'Reservas, pedidos y despacho construidos para cómo realmente opera su negocio — salones, restaurantes, flotas de transporte. Historial de clientes, programación y estado en tiempo real en un solo sistema que le pertenece.' },
    { eyebrow: 'Desde $1,200', title: 'Arquitectura web', body: 'Desde una sola página de aterrizaje rápida hasta un proyecto interactivo completo con su propia capa 3D. Una Página ($1,200), Tres Páginas ($2,000), Suite de Cinco Páginas ($3,000), Proyecto Apex ($5,000+).' },
  ],
  closing: {
    title: 'Cuéntenos qué está tratando de construir.',
    paragraph: 'Los proyectos personales comienzan en $250. Los proyectos de negocio comienzan en $750. Los proyectos web comienzan en $1,200. Treinta minutos bastan para saber el punto de partida correcto para el suyo.',
    button: 'Hablar con un experto',
  },
  footer: { tagline: 'Meridian es una empresa de', suffix: '' },
  chatIntake: {
    step1: {
      heading: '¿Con quién estamos hablando?',
      subtext: 'Su nombre y correo — para saber quién nos contacta.',
      namePlaceholder: 'Su nombre',
      emailPlaceholder: 'usted@empresa.com',
    },
    step2: {
      heading: '¿Qué está construyendo?',
      subtext: 'Una idea aproximada está bien — entramos en detalle en la llamada.',
      options: ['Software', 'Hardware', 'Ambos / aún no estoy seguro'],
    },
    step3: {
      heading: '¿Algo más que debamos saber?',
      subtext: 'Opcional — plazos, restricciones, lo que ya está construido.',
      phoneLabel: 'Teléfono (opcional) — si prefiere que lo llamemos.',
      phonePlaceholder: '(555) 000-0000',
    },
    back: 'Atrás',
    continue: 'Continuar',
    sending: 'Enviando…',
    send: 'Enviar',
    successTitle: 'Listo.',
    successBody: 'Le responderemos desde info@meridiangtn.com dentro de un día.',
    errorTitle: 'No pudimos enviar eso.',
    errorBody: 'Escríbanos directamente y lo tomamos desde ahí.',
  },
};

export const meridianCopy: Record<'en' | 'es', MeridianCopy> = { en, es };
