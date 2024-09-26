// Uniforms
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Light direction
    vec3 lightDir = normalize(uSunPosition - vPosition);
    float lightStr = dot(lightDir, vNormal);

    // Day / Night texture
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = dayColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
