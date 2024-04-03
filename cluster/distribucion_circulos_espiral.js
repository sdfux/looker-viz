<!DOCTYPE html>
<html>
<body>

<canvas id="myCanvas" width="1200" height="800" style="border:1px solid #000000;">
Your browser does not support the canvas element.
</canvas>

<script>
function drawSpiral(n, diameter) {
    var canvas = document.getElementById('myCanvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;

        var distanceBetweenCenters = diameter + 5; // Diámetro + padding
        var b = distanceBetweenCenters / (2 * Math.PI) / 2; // Hacemos que 'b' sea menor para acercar más los círculos

        var circles = []; // Almacenar las posiciones de los centros de los círculos

        // Función para verificar si un círculo se superpone con otros círculos
        function checkCollision(x, y) {
            for (var i = 0; i < circles.length; i++) {
                var dx = circles[i][0] - x;
                var dy = circles[i][1] - y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < diameter) {
                    return true; // Colisión detectada
                }
            }
            return false; // Sin colisión
        }

        // Dibuja cada círculo
//        for (var i = 1; i <= n; i++) { // Comenzamos desde 1 para omitir el círculo central
        let i = 1;
        while ( circles.length <= n-1) {
            var theta = i * (Math.sqrt(distanceBetweenCenters / b) / Math.sqrt(i));
            var r = b * theta;

            var x = centerX + r * Math.cos(theta);
            var y = centerY + r * Math.sin(theta);

            // Verificar colisiones
            if (!checkCollision(x, y)) {
                circles.push([x, y]); // Si no hay colisión, agregamos las coordenadas al arreglo
                ctx.beginPath();
                ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
            i = ++i;
        }
    }
}

drawSpiral(100, 20); // 100 círculos, 20px de diámetro
</script>

</body>
</html>