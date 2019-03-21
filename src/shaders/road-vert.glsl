#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;

void main()
{
  fs_Col = vs_Col;
  fs_Pos = vs_Pos;
  //scale by width and height
  fs_Pos.x = vs_Pos.x * vs_Col.x;
  fs_Pos.y = vs_Pos.y * vs_Col.y;

  //rotate
  float s = sin(vs_Col.z);
  float c = cos(vs_Col.z);
  fs_Pos.xy = mat2(c, s, -s, c) * fs_Pos.xy;

  //translate
  fs_Pos.x += vs_Translate.x;
  fs_Pos.y += vs_Translate.y;
  if(vs_Pos.x == 0.0) {
//    fs_Pos.x
  }

  gl_Position = fs_Pos;
}
