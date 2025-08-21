attribute vec3 aCenter;

uniform vec3 uMouse;
uniform float uRadius;
uniform float uStrength;
uniform float uLerp; // 👈 new uniform (0.0 → 1.0)

void main() {
    vec3 pos = csm_Position;

    float dist = distance(aCenter, uMouse);

        if(dist < uRadius) {
            vec2 dir = normalize(aCenter.xy - uMouse.xy);
            float fallOff = 1.0 - (dist / uRadius);
            float pushToBorder = (uRadius - dist);

            // 👇 smooth factor apply karo
            pos.xy += dir * pushToBorder * uStrength * fallOff * uLerp;
        }

    csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
