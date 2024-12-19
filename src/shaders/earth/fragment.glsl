// Uniforms
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunPosition;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

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
    float cloudMix = smoothstep(.5, 1.0, specularClouds.g);
    cloudMix *= dayMix;
    color = mix(color, vec3(1.0), cloudMix);

     // Fresnel Effect
    float fresnel = pow(1.0 - abs(dot(viewDirection, normal)), 2.0);;
    //  Atmosphere color fresnel mix

    // Atmosphere
    float atmosphereDayMix = smoothstep(- .5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular - use the reflect function glsl provides
    vec3 reflection = reflect(- normalizedSunPosition, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);

    // specular map - use clouds map (r channel)
    specular *= specularClouds.r;           // No specular on the contenents
    specular *= specularClouds.g;           // only reflect on the clouds

    // Create specular color when specular is on the edges
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    //color = vec3(specularClouds.g);

    // Final color
    gl_FragColor = vec4(color, 1.0);
    //gl_FragColor = vec4(vec3(sunOrientation), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
