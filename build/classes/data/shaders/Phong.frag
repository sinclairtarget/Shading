#version 330

// FRAGMENT SHADER
// Implements lambertian diffuse, phong specular, and ambient lighting models

in vec4 cameraSpacePosition;
in vec4 vertexNormal;

out vec4 outputColor;

uniform vec4 diffuseColor;
uniform vec4 modelSpaceLightPos;
uniform vec4 cameraSpaceLightPos;
uniform vec4 lightIntensity;
uniform vec4 ambientIntensity;
uniform float lightAttenuation;
uniform float shininess;

const vec4 specularColor = vec4(0.75, 0.75, 0.75, 1.0);

// calculates the attenuation factor of the light as well as the normalized
// light direction
float calcAttenuation(in vec4 cameraSpacePosition, out vec4 lightDirection)
{
	vec4 lightDifference = cameraSpaceLightPos - cameraSpacePosition;
	float lightDistanceSqr = dot(lightDifference, lightDifference);
	lightDirection = lightDifference * inversesqrt(lightDistanceSqr);

	return (1 / (1.0 + lightAttenuation * sqrt(lightDistanceSqr)));
}

void main()
{
	// attenuation
	vec4 lightDir = vec4(0.0);
	float attenuationFactor = calcAttenuation(cameraSpacePosition, lightDir);
	vec4 attenuatedIntensity = attenuationFactor * lightIntensity;

	// incidence
	vec4 surfaceNormal = normalize(vertexNormal);
	float cosAngIncidence = dot(surfaceNormal, lightDir);
	cosAngIncidence = clamp(cosAngIncidence, 0, 1);

	// phong term calculation
	vec4 viewDirection = normalize(-cameraSpacePosition);
	vec4 reflectDirection = reflect(-lightDir, surfaceNormal);
	float phongTerm = dot(viewDirection, reflectDirection);
	phongTerm = clamp(phongTerm, 0, 1);
	phongTerm = cosAngIncidence != 0.0 ? phongTerm : 0.0;
	phongTerm = pow(phongTerm, shininess);

	// lambertian diffuse + phong specular + ambient
	outputColor = (diffuseColor * attenuatedIntensity * cosAngIncidence) +
				  (specularColor * attenuatedIntensity * phongTerm) +
				  (diffuseColor * ambientIntensity);
}
