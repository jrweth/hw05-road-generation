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
  //water level
  float waterLevel = 0.4;

  //elevation map
  if(u_MapType == 1) {
    if(fs_Col.x < waterLevel) {
       out_Col = vec4(0.4, 0.4, 1.0, 1.0);
    }
    else {
      out_Col = vec4(vec3(fs_Col.r), 1.0);
    }
  }

  //flat map
  else if(u_MapType == 2) {
    if(fs_Col.x < waterLevel) {
       out_Col = vec4(0.4, 0.4, 1.0, 1.0);
    }
    else {
      out_Col = vec4(vec3(0.8), 1.0);
    }
  }

  //population density
  if(u_MapType == 3) {
    if(fs_Col.x < waterLevel) {
       out_Col = vec4(0.4, 0.4, 1.0, 1.0);
    }
    else {
      out_Col = vec4(vec3(fs_Col.g), 1.0);
    }
      out_Col = vec4(vec3(fs_Col.g), 1.0);
  }
}
