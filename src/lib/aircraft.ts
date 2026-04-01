export interface AircraftModel {
  id: string;
  name: string;
  description: string;
  category: 'helicopter' | 'jet' | 'prop' | 'stealth' | 'drone';
  unlockLevel: number;
  accentColor: string;
  draw: (ctx: CanvasRenderingContext2D, angle: number, glow: boolean, glowRgb: string, time: number) => void;
}

function drawRotorBlades(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number, color: string) {
  const bladeCount = 4;
  const spin = time * 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < bladeCount; i++) {
    const a = (Math.PI * 2 * i) / bladeCount;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawTailRotor(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, time: number, color: string) {
  const spin = time * 20;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = (Math.PI * 2 * i) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

export const AIRCRAFT_MODELS: AircraftModel[] = [
  // --- 1. Classic Helicopter ---
  {
    id: 'heli-classic',
    name: 'Sky Hawk',
    description: 'A reliable twin-blade helicopter. Smooth and iconic.',
    category: 'helicopter',
    unlockLevel: 1,
    accentColor: '#43E7FF',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.3);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
      }

      // Tail boom
      ctx.fillStyle = '#606878';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-42, -2);
      ctx.lineTo(-42, 2);
      ctx.closePath();
      ctx.fill();

      // Tail fin
      ctx.fillStyle = '#4A90D9';
      ctx.beginPath();
      ctx.moveTo(-40, -2);
      ctx.lineTo(-48, -14);
      ctx.lineTo(-44, -14);
      ctx.lineTo(-38, -2);
      ctx.closePath();
      ctx.fill();

      drawTailRotor(ctx, -45, -14, 7, time, '#B0C4DE');

      // Body
      const bodyGrad = ctx.createLinearGradient(-14, -12, 10, 14);
      bodyGrad.addColorStop(0, '#3A7BD5');
      bodyGrad.addColorStop(1, '#1E4D8C');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(20, -10, 8, -13);
      ctx.lineTo(-12, -10);
      ctx.quadraticCurveTo(-18, -6, -18, 0);
      ctx.quadraticCurveTo(-18, 6, -12, 10);
      ctx.lineTo(8, 11);
      ctx.quadraticCurveTo(20, 8, 18, 0);
      ctx.closePath();
      ctx.fill();

      // Windshield
      ctx.fillStyle = 'rgba(173,216,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(18, -8, 8, -10);
      ctx.lineTo(2, -9);
      ctx.quadraticCurveTo(4, 0, 2, 8);
      ctx.lineTo(8, 9);
      ctx.quadraticCurveTo(18, 6, 18, 0);
      ctx.closePath();
      ctx.fill();

      // Skids
      ctx.strokeStyle = '#8899AA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 14);
      ctx.lineTo(14, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(14, -14);
      ctx.stroke();
      ctx.strokeStyle = '#8899AA';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-6, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, 10); ctx.lineTo(6, 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(-6, -14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -10); ctx.lineTo(6, -14); ctx.stroke();

      // Main rotor
      drawRotorBlades(ctx, 0, -16, 30, time, 'rgba(200,220,240,0.7)');

      ctx.restore();
    },
  },

  // --- 2. Military Attack Helicopter ---
  {
    id: 'heli-attack',
    name: 'Viper Strike',
    description: 'Armed attack helicopter. Aggressive and powerful.',
    category: 'helicopter',
    unlockLevel: 1,
    accentColor: '#B9FF66',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.3);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
      }

      // Tail boom
      ctx.fillStyle = '#3A4028';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-46, -1);
      ctx.lineTo(-46, 1);
      ctx.closePath();
      ctx.fill();

      // Tail fin (dual)
      ctx.fillStyle = '#4A5530';
      ctx.beginPath();
      ctx.moveTo(-44, -1);
      ctx.lineTo(-50, -12);
      ctx.lineTo(-46, -12);
      ctx.lineTo(-40, -1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-44, 1);
      ctx.lineTo(-50, 12);
      ctx.lineTo(-46, 12);
      ctx.lineTo(-40, 1);
      ctx.closePath();
      ctx.fill();

      drawTailRotor(ctx, -48, -12, 6, time, '#8FA870');

      // Body — angular military shape
      const bodyGrad = ctx.createLinearGradient(-10, -10, 10, 10);
      bodyGrad.addColorStop(0, '#5A6840');
      bodyGrad.addColorStop(1, '#3A4428');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(14, -8);
      ctx.lineTo(-4, -10);
      ctx.lineTo(-14, -7);
      ctx.lineTo(-14, 7);
      ctx.lineTo(-4, 10);
      ctx.lineTo(14, 8);
      ctx.closePath();
      ctx.fill();

      // Nose / cockpit
      ctx.fillStyle = 'rgba(180,200,140,0.5)';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(14, -6);
      ctx.lineTo(6, -6);
      ctx.quadraticCurveTo(8, 0, 6, 6);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();

      // Stub wings
      ctx.fillStyle = '#4A5530';
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(4, -18);
      ctx.lineTo(-2, -18);
      ctx.lineTo(-6, -10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.lineTo(4, 18);
      ctx.lineTo(-2, 18);
      ctx.lineTo(-6, 10);
      ctx.closePath();
      ctx.fill();

      // Missile pods on stub wings
      ctx.fillStyle = '#888';
      ctx.fillRect(0, -19, 5, 2);
      ctx.fillRect(0, 17, 5, 2);

      // Main rotor
      drawRotorBlades(ctx, 0, -12, 32, time, 'rgba(160,180,140,0.65)');

      ctx.restore();
    },
  },

  // --- 3. Modern Stealth Fighter ---
  {
    id: 'jet-stealth',
    name: 'Phantom X',
    description: 'Next-gen stealth fighter. Sleek angular design.',
    category: 'stealth',
    unlockLevel: 3,
    accentColor: '#7D5CFF',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.25);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
      }

      // Engine exhaust glow
      const exhaustFlicker = 0.7 + Math.sin(time * 15) * 0.3;
      ctx.fillStyle = `rgba(125,92,255,${0.3 * exhaustFlicker})`;
      ctx.beginPath();
      ctx.ellipse(-38, 0, 10 + Math.sin(time * 20) * 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main body — angular diamond
      const bodyGrad = ctx.createLinearGradient(0, -15, 0, 15);
      bodyGrad.addColorStop(0, '#2A2D3A');
      bodyGrad.addColorStop(0.5, '#1A1D2A');
      bodyGrad.addColorStop(1, '#2A2D3A');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(8, -6);
      ctx.lineTo(-20, -5);
      ctx.lineTo(-32, 0);
      ctx.lineTo(-20, 5);
      ctx.lineTo(8, 6);
      ctx.closePath();
      ctx.fill();

      // Swept wings — delta shape
      ctx.fillStyle = '#22253A';
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(-14, -26);
      ctx.lineTo(-24, -22);
      ctx.lineTo(-20, -5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(4, 6);
      ctx.lineTo(-14, 26);
      ctx.lineTo(-24, 22);
      ctx.lineTo(-20, 5);
      ctx.closePath();
      ctx.fill();

      // Canopy
      ctx.fillStyle = 'rgba(125,92,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(14, -4);
      ctx.lineTo(8, -3);
      ctx.quadraticCurveTo(10, 0, 8, 3);
      ctx.lineTo(14, 4);
      ctx.closePath();
      ctx.fill();

      // Wing edges highlight
      ctx.strokeStyle = 'rgba(125,92,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, -6); ctx.lineTo(-14, -26);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, 6); ctx.lineTo(-14, 26);
      ctx.stroke();

      // Tail fins
      ctx.fillStyle = '#1E2030';
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-30, -12);
      ctx.lineTo(-34, -10);
      ctx.lineTo(-30, -4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-24, 5);
      ctx.lineTo(-30, 12);
      ctx.lineTo(-34, 10);
      ctx.lineTo(-30, 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
  },

  // --- 4. Prop Plane / Biplane ---
  {
    id: 'prop-classic',
    name: 'Barnstormer',
    description: 'Vintage propeller biplane. Old-school charm.',
    category: 'prop',
    unlockLevel: 1,
    accentColor: '#FFC94A',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.3);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
      }

      // Upper wing
      ctx.fillStyle = '#D4A44C';
      ctx.beginPath();
      ctx.roundRect(-18, -18, 40, 6, 3);
      ctx.fill();

      // Lower wing
      ctx.fillStyle = '#C49240';
      ctx.beginPath();
      ctx.roundRect(-18, 12, 40, 6, 3);
      ctx.fill();

      // Wing struts
      ctx.strokeStyle = '#AA8836';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-10, 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(10, 12); ctx.stroke();

      // Fuselage
      const bodyGrad = ctx.createLinearGradient(0, -6, 0, 6);
      bodyGrad.addColorStop(0, '#E8C860');
      bodyGrad.addColorStop(1, '#C8A040');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-22, -6, 48, 12, 4);
      ctx.fill();

      // Tail
      ctx.fillStyle = '#B8922E';
      ctx.beginPath();
      ctx.moveTo(-22, -4);
      ctx.lineTo(-32, -12);
      ctx.lineTo(-32, 12);
      ctx.lineTo(-22, 4);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = 'rgba(255,240,180,0.5)';
      ctx.beginPath();
      ctx.arc(8, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#AA8836';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Nose cone
      ctx.fillStyle = '#8B7328';
      ctx.beginPath();
      ctx.moveTo(26, -4);
      ctx.lineTo(32, 0);
      ctx.lineTo(26, 4);
      ctx.closePath();
      ctx.fill();

      // Propeller
      const propSpin = time * 18;
      ctx.save();
      ctx.translate(32, 0);
      ctx.rotate(propSpin);
      ctx.fillStyle = '#5A4820';
      ctx.fillRect(-1, -16, 3, 32);
      ctx.fillRect(-16, -1, 32, 3);
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#777';
      ctx.fill();
      ctx.restore();

      ctx.restore();
    },
  },

  // --- 5. Racing Drone ---
  {
    id: 'drone-racer',
    name: 'Bolt FPV',
    description: 'High-speed racing drone. Nimble and fast.',
    category: 'drone',
    unlockLevel: 2,
    accentColor: '#FF6B6B',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.3);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
      }

      const armPositions = [
        { x: 14, y: -16 },
        { x: 14, y: 16 },
        { x: -14, y: -16 },
        { x: -14, y: 16 },
      ];

      // Arms
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 3;
      for (const pos of armPositions) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      // Center body
      const bodyGrad = ctx.createLinearGradient(-8, -6, 8, 6);
      bodyGrad.addColorStop(0, '#2A2A2A');
      bodyGrad.addColorStop(1, '#1A1A1A');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-10, -8, 20, 16, 4);
      ctx.fill();

      // LED strip
      const ledFlicker = 0.6 + Math.sin(time * 8) * 0.4;
      ctx.fillStyle = `rgba(255,107,107,${ledFlicker})`;
      ctx.fillRect(-6, -9, 12, 2);

      // Camera lens
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(12, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,60,60,${0.3 + Math.sin(time * 4) * 0.2})`;
      ctx.beginPath();
      ctx.arc(12, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Motor housings + prop blur
      for (const pos of armPositions) {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();

        const propAlpha = 0.15 + Math.sin(time * 25 + pos.x) * 0.05;
        ctx.fillStyle = `rgba(200,200,200,${propAlpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
  },

  // --- 6. Combat Jet ---
  {
    id: 'jet-fighter',
    name: 'Falcon MK-II',
    description: 'Classic air superiority fighter. Fast and lethal.',
    category: 'jet',
    unlockLevel: 2,
    accentColor: '#43E7FF',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.25);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
      }

      // Afterburner
      const exhaustFlicker = 0.6 + Math.sin(time * 18) * 0.4;
      ctx.fillStyle = `rgba(67,231,255,${0.2 * exhaustFlicker})`;
      ctx.beginPath();
      ctx.ellipse(-34, -3, 8 + Math.sin(time * 22) * 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(67,231,255,${0.2 * exhaustFlicker})`;
      ctx.beginPath();
      ctx.ellipse(-34, 3, 8 + Math.sin(time * 22) * 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fuselage
      const bodyGrad = ctx.createLinearGradient(0, -8, 0, 8);
      bodyGrad.addColorStop(0, '#D0D4DC');
      bodyGrad.addColorStop(0.5, '#A8AEB8');
      bodyGrad.addColorStop(1, '#D0D4DC');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(16, -7);
      ctx.lineTo(-22, -6);
      ctx.lineTo(-28, -4);
      ctx.lineTo(-28, 4);
      ctx.lineTo(-22, 6);
      ctx.lineTo(16, 7);
      ctx.closePath();
      ctx.fill();

      // Swept wings
      ctx.fillStyle = '#B8BCC4';
      ctx.beginPath();
      ctx.moveTo(6, -7);
      ctx.lineTo(-8, -28);
      ctx.lineTo(-20, -24);
      ctx.lineTo(-14, -6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, 7);
      ctx.lineTo(-8, 28);
      ctx.lineTo(-20, 24);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fill();

      // Canopy
      ctx.fillStyle = 'rgba(100,200,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(14, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail fins (dual vertical stabilizers)
      ctx.fillStyle = '#98A0AC';
      ctx.beginPath();
      ctx.moveTo(-22, -6);
      ctx.lineTo(-26, -15);
      ctx.lineTo(-30, -13);
      ctx.lineTo(-28, -5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-22, 6);
      ctx.lineTo(-26, 15);
      ctx.lineTo(-30, 13);
      ctx.lineTo(-28, 5);
      ctx.closePath();
      ctx.fill();

      // Engine intakes
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.ellipse(-2, -8, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-2, 8, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
  },

  // --- 7. Futuristic VTOL ---
  {
    id: 'vtol-future',
    name: 'Nova VTOL',
    description: 'Sci-fi vertical takeoff craft. The future is now.',
    category: 'drone',
    unlockLevel: 4,
    accentColor: '#43E7FF',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.25);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.14)`;
        ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill();
      }

      // Thruster glow (bottom)
      const thrustPulse = 0.5 + Math.sin(time * 10) * 0.3;
      ctx.fillStyle = `rgba(67,231,255,${0.15 * thrustPulse})`;
      ctx.beginPath();
      ctx.ellipse(-18, 0, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main hull
      const hullGrad = ctx.createLinearGradient(0, -14, 0, 14);
      hullGrad.addColorStop(0, '#1A2844');
      hullGrad.addColorStop(0.5, '#0F1A30');
      hullGrad.addColorStop(1, '#1A2844');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.quadraticCurveTo(20, -10, 6, -11);
      ctx.lineTo(-16, -9);
      ctx.quadraticCurveTo(-22, -4, -22, 0);
      ctx.quadraticCurveTo(-22, 4, -16, 9);
      ctx.lineTo(6, 11);
      ctx.quadraticCurveTo(20, 10, 24, 0);
      ctx.closePath();
      ctx.fill();

      // Armor panels
      ctx.strokeStyle = 'rgba(67,231,255,0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(-4, 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-12, 9); ctx.stroke();

      // Canopy
      ctx.fillStyle = 'rgba(67,231,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(12, 0, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Side engines
      const enginePositions = [
        { x: -6, y: -16 },
        { x: -6, y: 16 },
      ];
      for (const pos of enginePositions) {
        ctx.fillStyle = '#0D1520';
        ctx.beginPath();
        ctx.roundRect(pos.x - 8, pos.y - 4, 16, 8, 3);
        ctx.fill();

        const gPulse = 0.5 + Math.sin(time * 12 + pos.y) * 0.3;
        ctx.fillStyle = `rgba(67,231,255,${0.4 * gPulse})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wing stubs
      ctx.fillStyle = '#152238';
      ctx.beginPath();
      ctx.moveTo(2, -11);
      ctx.lineTo(6, -18);
      ctx.lineTo(-8, -16);
      ctx.lineTo(-6, -10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 11);
      ctx.lineTo(6, 18);
      ctx.lineTo(-8, 16);
      ctx.lineTo(-6, 10);
      ctx.closePath();
      ctx.fill();

      // Glowing trim
      ctx.strokeStyle = `rgba(67,231,255,${0.3 + Math.sin(time * 6) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.quadraticCurveTo(20, -10, 6, -11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.quadraticCurveTo(20, 10, 6, 11);
      ctx.stroke();

      ctx.restore();
    },
  },

  // --- 8. Heavy Transport Helicopter ---
  {
    id: 'heli-heavy',
    name: 'Chinook',
    description: 'Twin-rotor heavy lifter. Massive and imposing.',
    category: 'helicopter',
    unlockLevel: 3,
    accentColor: '#FFC94A',
    draw(ctx, angle, glow, glowRgb, time) {
      const a = angle * Math.PI / 180;
      ctx.save();
      ctx.rotate(a * 0.3);

      if (glow) {
        ctx.fillStyle = `rgba(${glowRgb},0.12)`;
        ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
      }

      // Body — long rectangular
      const bodyGrad = ctx.createLinearGradient(0, -10, 0, 10);
      bodyGrad.addColorStop(0, '#6B6030');
      bodyGrad.addColorStop(1, '#4A4220');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-28, -10, 56, 20, 6);
      ctx.fill();

      // Windows row
      ctx.fillStyle = 'rgba(200,200,140,0.3)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.roundRect(-20 + i * 10, -8, 6, 5, 1.5);
        ctx.fill();
      }

      // Ramp
      ctx.fillStyle = '#3A3618';
      ctx.beginPath();
      ctx.moveTo(-28, -8);
      ctx.lineTo(-34, -6);
      ctx.lineTo(-34, 6);
      ctx.lineTo(-28, 8);
      ctx.closePath();
      ctx.fill();

      // Landing gear
      ctx.strokeStyle = '#5A5430';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-22, 10); ctx.lineTo(-22, 15); ctx.moveTo(-22, 15); ctx.lineTo(22, 15); ctx.moveTo(22, 15); ctx.lineTo(22, 10); ctx.stroke();

      // Front rotor
      drawRotorBlades(ctx, 20, -14, 26, time, 'rgba(180,170,120,0.6)');

      // Rear rotor
      drawRotorBlades(ctx, -22, -14, 26, time * 1.1 + 1, 'rgba(180,170,120,0.6)');

      ctx.restore();
    },
  },
];

export function getAircraftById(id: string): AircraftModel {
  return AIRCRAFT_MODELS.find(m => m.id === id) || AIRCRAFT_MODELS[0];
}

export function getUnlockedAircraft(playerLevel: number): AircraftModel[] {
  return AIRCRAFT_MODELS.filter(m => m.unlockLevel <= playerLevel);
}
