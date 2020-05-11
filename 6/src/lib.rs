use wasm_bindgen::prelude::*;
use lerp::Lerp;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen]
  fn test(s: i32);
}

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    // #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    Ok(())
}


#[wasm_bindgen]
#[derive(Debug, Copy, Clone)]
pub struct Point {
  x: f32,
  y: f32,
  z: f32,
  dx: f32,
  dy: f32,
  dz: f32,
  index: i32,
  speed: f32,
}

#[wasm_bindgen]
pub struct Particles {
  points: Vec<Point>,
  vertices: Vec<f32>,
  count: u32,
  width: f32,
  height: f32,
  depth: f32,
  radius: f32,
}

#[wasm_bindgen]
impl Particles {
  #[wasm_bindgen(constructor)]
  pub fn new(particle_count: u32, width: f32, height: f32, depth: f32, radius: f32) -> Particles {
    let mut points = Vec::with_capacity(particle_count as usize);
    let mut vertices = Vec::with_capacity(particle_count as usize);

    for _i in 0..particle_count {
      let point = Point {
        x: width / 2.0 + 300. * ((js_sys::Math::random() as f32) - 0.5),
        y: height / 2.0 + 300. * ((js_sys::Math::random() as f32) - 0.5),
        z: depth / 2.0 + 50. * ((js_sys::Math::random() as f32) - 0.5),
        dx: ((_i / 2 + 1) as f32).sin() + ((js_sys::Math::random() as f32) - 0.5),
        dy: ((_i / 2 + 1) as f32).cos() + ((js_sys::Math::random() as f32) - 0.5),
        dz: ((_i / 2 + 1) as f32).cos() + ((js_sys::Math::random() as f32) - 0.5),
        index: _i as i32,
        speed: (js_sys::Math::random() / 2. + 0.1) as f32,
      };

      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      points.push(point);
    }

    Particles { points, vertices, count: particle_count, width, height, depth, radius }
  }

  pub fn update(&mut self, time: f32) {
    for i in 0..(self.count as usize) {
      self.check_collisions(self.points[i]);

      let mut step: f32 = (time / 3.).sin();

      if step > 0.0 {
        step = 1.0;
      } else {
        step = -1.0;
      }

      if step < 0.0 {
        if self.points[i].x > self.width / 2. + (self.points[i].index as f32)  { self.points[i].dx = self.points[i].dx.lerp(-1., 0.8); }
        if self.points[i].y > self.height / 2. + (self.points[i].index as f32 / 10.)  { self.points[i].dy = self.points[i].dy.lerp(-1., 0.8); }
        if self.points[i].x > self.depth / 2. + (self.points[i].index as f32)  { self.points[i].dz = self.points[i].dz.lerp(-1., 0.8); }

        if self.points[i].x < self.width / 2. + (self.points[i].index as f32)  { self.points[i].dx = self.points[i].dx.lerp(1., 0.8); }
        if self.points[i].y < self.height / 2. + (self.points[i].index as f32 / 10.)  { self.points[i].dy = self.points[i].dy.lerp(1., 0.8); }
        if self.points[i].x < self.depth / 2. + (self.points[i].index as f32)  { self.points[i].dz = self.points[i].dz.lerp(1., 0.8); }
      }

      // if step < 0.0 {
      //   self.points[i].dy = self.points[i].dy.lerp(100. * step, 0.5);
      // }

      let mut new_x = self.points[i].x + self.points[i].dx * self.points[i].speed;
      let mut new_y = self.points[i].y + self.points[i].dy * self.points[i].speed;
      let mut new_z = self.points[i].z + self.points[i].dz * self.points[i].speed;

      if new_x < 0.0 + self.radius / 2. || new_x > self.width - self.radius / 2. {
        self.points[i].dx *= -1.;
      }

      if new_x > self.width - self.radius / 2. {
        new_x = self.width - self.radius / 2.;
      } else if new_x < 0.0 + self.radius / 2. {
        new_x = 0.0 + self.radius / 2.;
      }

      if new_y < 0.0 + self.radius / 2. || new_y > self.height - self.radius / 2. {
        self.points[i].dy *= -1.;
      }

      if new_y > self.height - self.radius / 2. {
        new_y = self.height - self.radius / 2.;
      } else if new_y < 0.0 + self.radius / 2. {
        new_y = 0.0 + self.radius / 2.;
      }

      if new_z < 0.0 + self.radius / 2. || new_z > self.depth - self.radius / 2. {
        self.points[i].dz *= -1.;
      }

      if new_z < 0.0 + self.radius / 2. {
        new_z = 0.0 + self.radius / 2.;
      } else if new_z > self.depth - self.radius / 2. {
        new_z = self.depth - self.radius / 2.;
      }

      self.points[i].x = new_x;
      self.points[i].y = new_y;
      self.points[i].z = new_z;

      self.vertices[i * 3] = self.points[i].x;
      self.vertices[i * 3 + 1] = self.points[i].y;
      self.vertices[i * 3 + 2] = self.points[i].z;

      self.points[i].speed = self.points[i].speed.lerp(0.1, 0.05);
    }
  }

  pub fn check_collisions(&mut self, mut target: Point) {
    let size = self.count as usize;

    for i in 0..size {
      if target.index != self.points[i].index && Particles::check_distance(target.x, target.y, target.z, self.points[i].x, self.points[i].y, self.points[i].z) < self.radius * 2. {
        target.dx = target.x - self.points[i].x;
        target.dy = target.y - self.points[i].y;
        target.dz = target.z - self.points[i].z;

        self.points[i].dx = (self.points[i].x - target.x) * 1.5;
        self.points[i].dy = (self.points[i].y - target.y) * 1.5;
        self.points[i].dz = (self.points[i].z - target.z) * 1.5;

        target.speed = 0.05;
        self.points[i].speed = 0.05;

        // test(self.points[i].index as i32);
      }
    }
  }

  pub fn check_distance(x1: f32, y1: f32, z1: f32, x2: f32, y2: f32, z2: f32) -> f32 {
    let x = x1 - x2;
    let y = y1 - y2;
    let z = z1 - z2;

    return f32::sqrt((x * x) + (y * y) +  (z * z));
  }

  pub fn items(&self) -> *const f32 {
    return self.vertices.as_ptr();
  }
}
