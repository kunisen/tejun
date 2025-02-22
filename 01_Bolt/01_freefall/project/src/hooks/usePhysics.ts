import { useCallback, useEffect, useRef, useState } from 'react';
import { Ball, PhysicsConfig } from '../types';

const INITIAL_CONFIG: PhysicsConfig = {
  gravity: 199.81,
  airResistance: 0.001,
  windSpeed: 500,
  elasticity: 1.5,
};

export const usePhysics = (canvasWidth: number, canvasHeight: number) => {
  const [config, setConfig] = useState<PhysicsConfig>(INITIAL_CONFIG);
  const [ball, setBall] = useState<Ball>({
    x: canvasWidth / 2,
    y: 50,
    radius: 15,
    velocityY: 100, // Increased initial vertical velocity
    velocityX: 2,  // Added initial horizontal velocity for more interesting motion
  });

  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const updatePhysics = useCallback((deltaTime: number) => {
    setBall((prevBall) => {
      // Convert deltaTime to seconds
      const dt = deltaTime / 1000;

      // Calculate forces
      const gravityForce = config.gravity;
      const airResistanceForceY = -config.airResistance * prevBall.velocityY * Math.abs(prevBall.velocityY);
      const airResistanceForceX = -config.airResistance * prevBall.velocityX * Math.abs(prevBall.velocityX);
      const windForce = config.windSpeed;

      // Update velocities
      let newVelocityY = prevBall.velocityY + (gravityForce + airResistanceForceY) * dt;
      let newVelocityX = prevBall.velocityX + (windForce + airResistanceForceX) * dt;

      // Update positions
      let newY = prevBall.y + newVelocityY * dt;
      let newX = prevBall.x + newVelocityX * dt;

      // Handle collisions with canvas boundaries
      if (newY + prevBall.radius > canvasHeight) {
        newY = canvasHeight - prevBall.radius;
        newVelocityY = -newVelocityY * config.elasticity;
      }

      if (newX + prevBall.radius > canvasWidth) {
        newX = canvasWidth - prevBall.radius;
        newVelocityX = -newVelocityX * config.elasticity;
      } else if (newX - prevBall.radius < 0) {
        newX = prevBall.radius;
        newVelocityX = -newVelocityX * config.elasticity;
      }

      return {
        ...prevBall,
        x: newX,
        y: newY,
        velocityY: newVelocityY,
        velocityX: newVelocityX,
      };
    });
  }, [canvasHeight, canvasWidth, config]);

  const animate = useCallback((currentTime: number) => {
    if (lastTimeRef.current) {
      const deltaTime = currentTime - lastTimeRef.current;
      updatePhysics(deltaTime);
    }
    lastTimeRef.current = currentTime;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updatePhysics]);

  const resetBall = useCallback(() => {
    setBall({
      x: canvasWidth / 2,
      y: 50,
      radius: 15,
      velocityY: 10, // Updated to match initial velocity
      velocityX: 2,  // Updated to match initial velocity
    });
  }, [canvasWidth]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return { ball, config, setConfig, resetBall };
};