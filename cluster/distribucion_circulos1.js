<canvas id="miCanvas" width="600" height="600"></canvas>
<script>
function distribuirCirculos(cantidad, radioExterno) {
    const centro = { x: 300, y: 300 }; // Centro del círculo mayor
    const radioInterno = 20; // Radio de los círculos internos
    const padding = 5; // Espacio entre los círculos

    const puntos = [];
    const anguloSeparacion = (2 * Math.PI) / cantidad;

    for (let i = 0; i < cantidad; i++) {
        let angulo = i * anguloSeparacion;
        let x = centro.x + (radioExterno + radioInterno + padding) * Math.cos(angulo);
        let y = centro.y + (radioExterno + radioInterno + padding) * Math.sin(angulo);

        // Ajusta la posición para evitar colisiones
        while (colision(puntos, x, y, radioInterno + padding)) {
            x += Math.cos(angulo) * (radioInterno + padding);
            y += Math.sin(angulo) * (radioInterno + padding);
        }

        puntos.push({ x, y });
    }

    return puntos;
}

function colision(puntos, x, y, radio) {
    for (let punto of puntos) {
        let distancia = Math.sqrt((x - punto.x) ** 2 + (y - punto.y) ** 2);
        if (distancia < radio * 2) {
            return true; // Hay colisión
        }
    }
    return false; // No hay colisión
}

function dibujar(cantidadCirculos, radioExterno) {
    const puntos = distribuirCirculos(cantidadCirculos, radioExterno);
    const canvas = document.getElementById('miCanvas');
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibuja los círculos
        ctx.fillStyle = 'blue';
        puntos.forEach(punto => {
            ctx.beginPath();
            ctx.arc(punto.x, punto.y, 20, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Ejemplo de uso
dibujar(7, 20); // 10 círculos, radio externo de 200
</script>
