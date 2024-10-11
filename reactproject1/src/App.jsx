import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

function App() {
    const [mass, setMass] = useState(1.0);
    const [springConstant, setSpringConstant] = useState(10.0);
    const [dampingCoefficient, setDampingCoefficient] = useState(0.5);
    const [externalForce, setExternalForce] = useState(0);
    const [initialDisplacement, setInitialDisplacement] = useState(1.0);
    const [initialVelocity, setInitialVelocity] = useState(0.0);
    const [duration, setDuration] = useState(10.0);

    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const animationIdRef = useRef(null);

    
    let x = useRef(initialDisplacement);
    let v = useRef(initialVelocity);
    let t = useRef(0);
    const dt = 0.016;
    const pixelsPerMeter = 100;

    const [isSimulationRunning, setIsSimulationRunning] = useState(false);

    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        drawSimulation(ctx);

        // Initialize the chart
        initializeChart();

        // Cleanup
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    const initializeChart = () => {
        const ctx = chartRef.current.getContext("2d");

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Displacement (m)",
                        data: [],
                        borderColor: "blue",
                        fill: false,
                    },
                    {
                        label: "Velocity (m/s)",
                        data: [],
                        borderColor: "red",
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: "Spring-Mass-Damper System Simulation",
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Time (s)",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Displacement (m) / Velocity (m/s)",
                        },
                    },
                },
            },
        });
    };

    const drawSimulation = (ctx) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        function drawDamper(ctx, displacement) {
            // Coordinates for the damper body (stationary part)
            const damperBodyX = 150;
            const damperBodyY = 140;
            const damperBodyWidth = 20;
            const damperBodyHeight = 40;

            // Draw the stationary damper body
            ctx.beginPath();
            ctx.rect(damperBodyX, damperBodyY, damperBodyWidth, damperBodyHeight);
            ctx.stroke();

            // Coordinates for the piston head (moves with the mass)
            const pistonHeadX = canvasRef.current.width / 1.6 + displacement * pixelsPerMeter;  // The mass box's left edge
            const pistonHeadY = 160;

            // Draw the piston rod, connecting the stationary damper body to the moving piston head
            ctx.beginPath();
            ctx.moveTo(damperBodyX + damperBodyWidth, 160);  // Fixed part of the rod from damper body
            ctx.lineTo(pistonHeadX, pistonHeadY);  // Moving part that connects to the piston head
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw the piston head (attaches to the mass box)
            ctx.beginPath();
            ctx.arc(pistonHeadX, pistonHeadY, 10, 0, 2 * Math.PI);  // Piston head
            ctx.stroke();
        };


        drawDamper(ctx, x.current); 

        ctx.beginPath();
        ctx.moveTo(30, 160);
        ctx.lineTo(150, 160);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(20, 80);
        ctx.lineTo(20, 180);
        ctx.lineWidth = 20;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(560, 180);
        ctx.lineTo(10, 180);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(30, canvasRef.current.height / 1.6);
        ctx.lineTo(canvasRef.current.width / 1.6 + x.current* pixelsPerMeter, canvasRef.current.height / 1.6);
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = 2;
        ctx.stroke();

        function drawZigzag(ctx, startX, startY, endX, endY, steps) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);

            let x = startX;
            let y = startY;
            const stepSize = (endX - startX) / steps;
            const amplitude = 20;  // Height of the zigzag

            for (let i = 0; i < steps; i++) {
                // Move the zigzag to up or down in alternating steps
                x += stepSize;
                y = (i % 2 === 0) ? startY + amplitude : startY - amplitude;
                ctx.lineTo(x, y);
            }

            // Final straight line to the end position
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        drawZigzag(ctx, 30, canvasRef.current.height / 1.6, canvasRef.current.width / 1.6 + x.current * pixelsPerMeter,110,110);

        ctx.beginPath();
        ctx.rect(canvasRef.current.width / 1.6 + x.current * pixelsPerMeter, canvasRef.current.height / 1.9, 80,70)
        //ctx.arc(canvasRef.current.width / 1.6 + x * pixelsPerMeter, canvasRef.current.height / 1.6, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#FF0000";
        ctx.stroke();
        ctx.fillRect(canvasRef.current.width / 1.6 + x.current * pixelsPerMeter, canvasRef.current.height / 1.9, 80, 70)
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        console.log(x.current, t.current, v.current);
        ctx.fillText(`Time: ${t.current.toFixed(2)} s`, 10, 20);
        ctx.fillText(`Displacement: ${x.current.toFixed(2)} m`, 10, 40);
        ctx.fillText(`Velocity: ${v.current.toFixed(2)} m/s`, 10, 60);
    };
    useEffect(() => {
        if (isSimulationRunning) {
            animate();
        }
    }, [isSimulationRunning]);  
    const startSimulation = () => { 
        setIsSimulationRunning(true);
        animate();  // Continue from last known state
    };

    const stopSimulation = () => {
        setIsSimulationRunning(false);
        cancelAnimationFrame(animationIdRef.current);
    };

    const resetSimulation = () => {
        stopSimulation();
        x.current = initialDisplacement;  // Reset displacement
        v.current = initialVelocity;      // Reset velocity
        t.current = 0;                    // Reset time to 0
        console.log(t);
        const ctx = canvasRef.current.getContext("2d");
        drawSimulation(ctx);

        const chart = chartInstanceRef.current;
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];
        chart.update();
    };

    const animate = () => {
        if (!isSimulationRunning) return;

        if (t.current >= duration) {
            stopSimulation();
            return;
        }

        const ctx = canvasRef.current.getContext("2d");
        const chart = chartInstanceRef.current;

        const acceleration = (externalForce - springConstant * x.current - dampingCoefficient * v.current) / mass;
        v.current+= acceleration * dt;
        x.current += v.current * dt;
        t.current += dt;

        drawSimulation(ctx);

        chart.data.labels.push(t.current.toFixed(2));
        chart.data.datasets[0].data.push(x.current.toFixed(2));
        chart.data.datasets[1].data.push(v.current.toFixed(2));
        chart.update();

        animationIdRef.current = requestAnimationFrame(animate);

        return (x, v, t);
    };

    console.log(t);

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Spring-Mass-Damper System Simulation</h1>
            <div className="row mb-4">
                <div className="col-md-6">
                    <h2>Simulation Parameters</h2>
                    <form className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Mass (kg):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={mass}
                                onChange={(e) => setMass(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Spring Constant (N/m):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={springConstant}
                                onChange={(e) => setSpringConstant(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Damping Coefficient (Ns/m):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={dampingCoefficient}
                                onChange={(e) => setDampingCoefficient(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">External Force (N):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={externalForce}
                                onChange={(e) => setExternalForce(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Initial Displacement (m):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={initialDisplacement}
                                onChange={(e) => setInitialDisplacement(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Initial Velocity (m/s):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={initialVelocity}
                                onChange={(e) => setInitialVelocity(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Duration (s):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={duration}
                                onChange={(e) => setDuration(parseFloat(e.target.value))}
                                step="0.1"
                            />
                        </div>
                    </form>
                    <div className="mt-3">
                        <button className="btn btn-primary me-2" onClick={startSimulation}>
                            Start Simulation
                        </button>
                        <button className="btn btn-danger me-2" onClick={stopSimulation}>
                            Stop Simulation
                        </button>
                        <button className="btn btn-secondary" onClick={resetSimulation}>
                            Reset Simulation
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <h2>Simulation Output</h2>
                    <div className="mb-4">
                        <h4>Animation</h4>
                        <canvas ref={canvasRef} width="600" height="200" className="border border-dark"></canvas>
                    </div>
                    <div>
                        <h4>Displacement & Velocity Graph</h4>
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
