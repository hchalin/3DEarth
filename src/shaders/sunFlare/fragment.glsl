// Uniforms
uniform vec3 uSunPosition;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

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

    // Atmosphere
    float atmosphereDayMix = smoothstep(- .5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, atmosphereDayMix);

    // Alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    float dayAlpha = smoothstep(- 0.5, 0.0, sunOrientation);

    float alpha = edgeAlpha * dayAlpha;

    // Final color
    gl_FragColor = vec4(color, alpha);
    //gl_FragColor = vec4(vec3(sunOrientation), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
