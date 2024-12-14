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
    // Renormalize to get direction
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation -- I already have the sun position
    vec3 normalizedSunPosition = normalize(uSunPosition);
    //float sunOrientation = dot(uSunPosition, normal);         // Old
    float sunOrientation = dot(normalizedSunPosition, normal);



    // Day / Night texture
    float dayMix = smoothstep(-.25, .5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    // Specular clounds
    vec2 specularClouds = texture(uSpecularCloudsTexture, vUv).rg;

    // Clouds
    float cloudMix = specularClouds.g;
    color = mix(color, vec3(1.0), cloudMix);

    // Final color
    gl_FragColor = vec4(color, 1.0);
    //gl_FragColor = vec4(vec3(sunOrientation), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
