export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

/**
 * Create background floating particles
 */
export function createFloatingParticles(
  count: number,
  width: number,
  height: number,
  colors: string[]
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3, // Slow drift
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.2 + 0.1, // 0.1-0.3
      lifetime: 0,
      maxLifetime: Infinity, // Background particles never die
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  return particles;
}

/**
 * Create a burst of particles from a point
 */
export function createParticleBurst(
  x: number,
  y: number,
  count: number,
  color: string,
  speed: number = 2
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 2 + 1,
      opacity: 0.8,
      lifetime: 0,
      maxLifetime: 60, // 1 second at 60fps
      color,
    });
  }

  return particles;
}

/**
 * Create edge flow particles following a bezier curve
 */
export function createEdgeParticle(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  color: string
): Particle {
  return {
    x: sourceX,
    y: sourceY,
    vx: 0, // Velocity controlled by bezier path
    vy: 0,
    radius: 2.5,
    opacity: 0.7,
    lifetime: 0,
    maxLifetime: 120, // 2 seconds to travel along edge
    color,
  };
}

/**
 * Update particles with physics
 */
export function updateParticles(
  particles: Particle[],
  deltaTime: number = 1,
  width?: number,
  height?: number
): Particle[] {
  return particles
    .map((particle) => {
      // Update position
      let { x, y, vx, vy, lifetime, maxLifetime, opacity } = particle;

      x += vx * deltaTime;
      y += vy * deltaTime;
      lifetime += deltaTime;

      // Wrap around screen edges for background particles
      if (width && height && maxLifetime === Infinity) {
        if (x < 0) x = width;
        if (x > width) x = 0;
        if (y < 0) y = height;
        if (y > height) y = 0;
      }

      // Fade out near end of lifetime for burst particles
      if (maxLifetime !== Infinity) {
        const lifeRatio = lifetime / maxLifetime;
        if (lifeRatio > 0.7) {
          opacity = particle.opacity * (1 - (lifeRatio - 0.7) / 0.3);
        }
      }

      // Apply slight friction to burst particles
      if (maxLifetime !== Infinity) {
        vx *= 0.98;
        vy *= 0.98;
      }

      return {
        ...particle,
        x,
        y,
        vx,
        vy,
        lifetime,
        opacity,
      };
    })
    .filter((p) => p.lifetime < p.maxLifetime); // Remove dead particles
}

/**
 * Sample a point along a bezier curve (for edge particles)
 */
export function sampleBezierCurve(
  t: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  // Calculate control point for bezier curve (midpoint with perpendicular offset)
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Perpendicular offset for curve
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = distance * 0.2; // 20% curve

  const controlX = midX + (-dy / distance) * offset;
  const controlY = midY + (dx / distance) * offset;

  // Quadratic bezier formula
  const x =
    (1 - t) * (1 - t) * sourceX +
    2 * (1 - t) * t * controlX +
    t * t * targetX;
  const y =
    (1 - t) * (1 - t) * sourceY +
    2 * (1 - t) * t * controlY +
    t * t * targetY;

  return { x, y };
}

/**
 * Draw a particle on canvas
 */
export function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle
): void {
  ctx.save();
  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
