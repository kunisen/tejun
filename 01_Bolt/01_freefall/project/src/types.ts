export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityY: number;
  velocityX: number;
}

export interface PhysicsConfig {
  gravity: number;
  airResistance: number;
  windSpeed: number;
  elasticity: number;
}