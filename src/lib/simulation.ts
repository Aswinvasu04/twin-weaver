// Client-side IoT simulation engine (discrete event simulation)

export interface SensorConfig {
  id: string;
  type: 'sensor' | 'actuator' | 'controller';
  name: string;
  params: Record<string, number | string>;
  logic?: string;
}

export interface TwinConfig {
  name: string;
  components: SensorConfig[];
  topology: Array<{ from: string; to: string }>;
  events: Array<{ time: number; action: string }>;
}

export interface SimulationState {
  time: number;
  readings: Record<string, number>;
  events: Array<{ time: number; component: string; message: string; type: 'info' | 'warning' | 'action' }>;
  active: Record<string, boolean>;
}

export interface SimulationHistory {
  timestamps: number[];
  series: Record<string, number[]>;
}

export function createDefaultTwin(): TwinConfig {
  return {
    name: "Smart Irrigation System",
    components: [
      { id: "soil_sensor", type: "sensor", name: "Soil Moisture Sensor", params: { moisture_threshold: 30, current: 65, decay_rate: 2 } },
      { id: "temp_sensor", type: "sensor", name: "Temperature Sensor", params: { current: 24, variance: 3 } },
      { id: "humidity_sensor", type: "sensor", name: "Humidity Sensor", params: { current: 55, variance: 8 } },
      { id: "pump", type: "actuator", name: "Water Pump", params: { flow_rate: 5, power: 0 }, logic: "if moisture < 30 then pump_on" },
      { id: "weather_alert", type: "controller", name: "Weather Alert Module", params: { rain_probability: 20 } },
    ],
    topology: [
      { from: "soil_sensor", to: "pump" },
      { from: "temp_sensor", to: "weather_alert" },
      { from: "humidity_sensor", to: "weather_alert" },
      { from: "weather_alert", to: "pump" },
    ],
    events: [],
  };
}

export function simulateStep(config: TwinConfig, prevState: SimulationState): SimulationState {
  const time = prevState.time + 1;
  const readings = { ...prevState.readings };
  const active = { ...prevState.active };
  const events: SimulationState['events'] = [];

  for (const comp of config.components) {
    if (comp.type === 'sensor') {
      const prev = readings[comp.id] ?? Number(comp.params.current) ?? 50;
      const decay = Number(comp.params.decay_rate ?? 0);
      const variance = Number(comp.params.variance ?? 2);

      // If pump is active and this is soil moisture, increase
      if (comp.id === 'soil_sensor' && active['pump']) {
        readings[comp.id] = Math.min(100, prev + Number(config.components.find(c => c.id === 'pump')?.params.flow_rate ?? 3));
      } else {
        readings[comp.id] = Math.max(0, Math.min(100, prev - decay + (Math.random() - 0.5) * variance));
      }
    }

    if (comp.type === 'actuator') {
      const threshold = Number(config.components.find(c => c.id === 'soil_sensor')?.params.moisture_threshold ?? 30);
      const moisture = readings['soil_sensor'] ?? 50;
      const shouldActivate = moisture < threshold;

      if (shouldActivate && !active[comp.id]) {
        active[comp.id] = true;
        events.push({ time, component: comp.name, message: `Activated — moisture at ${moisture.toFixed(1)}%`, type: 'action' });
      } else if (!shouldActivate && active[comp.id]) {
        active[comp.id] = false;
        events.push({ time, component: comp.name, message: `Deactivated — moisture at ${moisture.toFixed(1)}%`, type: 'info' });
      }

      readings[comp.id] = active[comp.id] ? 1 : 0;
    }

    if (comp.type === 'controller') {
      const rainProb = Number(comp.params.rain_probability ?? 20);
      const willRain = Math.random() * 100 < rainProb;
      if (willRain && time % 5 === 0) {
        events.push({ time, component: comp.name, message: '🌧 Rain detected — reducing irrigation', type: 'warning' });
        readings['soil_sensor'] = Math.min(100, (readings['soil_sensor'] ?? 50) + 15);
      }
      readings[comp.id] = willRain ? 1 : 0;
    }
  }

  return { time, readings, events: [...prevState.events, ...events].slice(-50), active };
}

export function initState(config: TwinConfig): SimulationState {
  const readings: Record<string, number> = {};
  const active: Record<string, boolean> = {};
  for (const comp of config.components) {
    readings[comp.id] = Number(comp.params.current ?? 0);
    active[comp.id] = false;
  }
  return { time: 0, readings, events: [], active };
}

export function parsePromptToConfig(prompt: string): TwinConfig {
  // Simple keyword-based parsing for V1 (will be replaced with AI)
  const lower = prompt.toLowerCase();
  const config: TwinConfig = {
    name: prompt.slice(0, 60),
    components: [],
    topology: [],
    events: [],
  };

  if (lower.includes('moisture') || lower.includes('soil') || lower.includes('irrigation')) {
    config.components.push({ id: "soil_sensor", type: "sensor", name: "Soil Moisture Sensor", params: { moisture_threshold: 30, current: 65, decay_rate: 2 } });
  }
  if (lower.includes('temp') || lower.includes('weather')) {
    config.components.push({ id: "temp_sensor", type: "sensor", name: "Temperature Sensor", params: { current: 24, variance: 3 } });
  }
  if (lower.includes('humid')) {
    config.components.push({ id: "humidity_sensor", type: "sensor", name: "Humidity Sensor", params: { current: 55, variance: 8 } });
  }
  if (lower.includes('pump') || lower.includes('irrigation') || lower.includes('water')) {
    config.components.push({ id: "pump", type: "actuator", name: "Water Pump", params: { flow_rate: 5, power: 0 }, logic: "if moisture < 30 then pump_on" });
  }
  if (lower.includes('weather') || lower.includes('alert') || lower.includes('rain')) {
    config.components.push({ id: "weather_alert", type: "controller", name: "Weather Alert Module", params: { rain_probability: 20 } });
  }
  if (lower.includes('light') || lower.includes('lux')) {
    config.components.push({ id: "light_sensor", type: "sensor", name: "Light Sensor", params: { current: 70, variance: 10 } });
  }
  if (lower.includes('motor') || lower.includes('fan')) {
    config.components.push({ id: "motor", type: "actuator", name: "Motor/Fan", params: { speed: 0, power: 0 }, logic: "if temp > 35 then fan_on" });
  }

  if (config.components.length === 0) return createDefaultTwin();

  // Auto-wire topology
  const sensors = config.components.filter(c => c.type === 'sensor');
  const actuators = config.components.filter(c => c.type === 'actuator');
  const controllers = config.components.filter(c => c.type === 'controller');

  for (const s of sensors) {
    for (const a of actuators) {
      config.topology.push({ from: s.id, to: a.id });
    }
    for (const c of controllers) {
      config.topology.push({ from: s.id, to: c.id });
    }
  }
  for (const c of controllers) {
    for (const a of actuators) {
      config.topology.push({ from: c.id, to: a.id });
    }
  }

  return config;
}

export function generateSimPyCode(config: TwinConfig): string {
  let code = `import simpy\nimport random\n\n`;
  code += `# TwinIT Generated SimPy Code\n`;
  code += `# Twin: ${config.name}\n\n`;

  for (const comp of config.components) {
    if (comp.type === 'sensor') {
      code += `def ${comp.id}_process(env, state):\n`;
      code += `    """${comp.name} simulation"""\n`;
      code += `    while True:\n`;
      code += `        state['${comp.id}'] = max(0, min(100, state.get('${comp.id}', ${comp.params.current ?? 50}) + random.uniform(-${comp.params.variance ?? 2}, ${comp.params.variance ?? 2})))\n`;
      code += `        yield env.timeout(1)\n\n`;
    }
    if (comp.type === 'actuator') {
      code += `def ${comp.id}_process(env, state):\n`;
      code += `    """${comp.name} — Logic: ${comp.logic ?? 'auto'}"""\n`;
      code += `    while True:\n`;
      code += `        # Add control logic here\n`;
      code += `        yield env.timeout(1)\n\n`;
    }
  }

  code += `# Run simulation\n`;
  code += `env = simpy.Environment()\n`;
  code += `state = {}\n`;
  for (const comp of config.components) {
    code += `env.process(${comp.id}_process(env, state))\n`;
  }
  code += `env.run(until=100)\n`;

  return code;
}
