#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform int u_MapType;
uniform float u_Time;

in vec4 fs_Pos;
in vec4 fs_Col;
out vec4 out_Col;

void main() {
  int mapType = 1;
  //straight map
  if(mapType == 1) {
    if(fs_Col.x < 0.4) {
       out_Col = vec4(0.4, 0.4, 1.0, 1.0);
    }
    else {
      out_Col = vec4(0.0, fs_Col.r, 0.0, 1.0);
    }
  }
}
