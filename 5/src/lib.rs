use wasm_bindgen::prelude::*;
use std::cmp;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen]
  fn test(s: i32);

  // Use `js_namespace` here to bind `console.log(..)` instead of just
  // `log(..)`
  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);

  // The `console.log` is quite polymorphic, so we can bind it with multiple
  // signatures. Note that we need to use `js_name` to ensure we always call
  // `log` in JS.
  #[wasm_bindgen(js_namespace = console, js_name = log)]
  fn log_u32(a: u32);

  #[wasm_bindgen(js_namespace = console, js_name = log)]
  fn log_f32(a: f32);

  // Multiple arguments too!
  #[wasm_bindgen(js_namespace = console, js_name = log)]
  fn log_many(a: &str, b: &str);
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
  index: i32,
  mass: f32
}

#[wasm_bindgen]
#[derive(Debug, Copy, Clone)]
pub struct Constraint {
  points: [usize; 2],
  resting_distance: f32,
  stiffness: f32
}

#[wasm_bindgen]
pub struct Particles {
  points: Vec<Point>,
  vertices: Vec<f32>,
  constraints: Vec<Constraint>,
  count: u32,
  width: f32,
  height: f32,
  depth: f32,
}

#[wasm_bindgen]
impl Particles {
  #[wasm_bindgen(constructor)]
  pub fn new(particle_count: u32, width: f32, height: f32, depth: f32) -> Particles {
    let mut points = Vec::with_capacity(particle_count as usize);
    let mut vertices = Vec::with_capacity(particle_count as usize);
    let mut constraints = Vec::with_capacity((particle_count * particle_count) as usize);

    let grid_size = (particle_count as f32).sqrt();

    for _i in 0..particle_count {
      let mut mass = 2.0 - (_i / particle_count) as f32;

      let row = (_i as f32 / grid_size).floor();
      let column = _i as f32 % grid_size;

      let point = Point {
        x: width / 2.0 + 25. * (column - grid_size / 2.),
        y: height / 2.0 + 25. * (row - grid_size / 2.),
        z: depth / 2.0,
        index: _i as i32,
        mass: mass
      };

      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      points.push(point);
    }

    let mut stiffness = 0.8;

    for _i in 0..particle_count {
      let row = (_i as f32 / grid_size).floor() as u32;
      let column = _i % grid_size as u32;

      // stiffness += ((js_sys::Math::random() as f32) - 0.5) / 100.;

      if column >= 1 {
        let target_index = _i - 1;

        let distance: f32 = Particles::check_distance(
          points[target_index as usize].x,
          points[target_index as usize].y,
          points[target_index as usize].z,
          points[_i as usize].x,
          points[_i as usize].y,
          points[_i as usize].z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness: stiffness / 2.0 };
        constraints.push(constraint);
      }

      if row >= 1 {
        let target_index = (_i as f32 - grid_size).floor();

        let distance: f32 = Particles::check_distance(
          points[target_index as usize].x,
          points[target_index as usize].y,
          points[target_index as usize].z,
          points[_i as usize].x,
          points[_i as usize].y,
          points[_i as usize].z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness };
        constraints.push(constraint);
      }

      if column >= 1 && row >= 1 {
        let target_index = (_i as f32 - grid_size - 1.0).floor();

        let distance: f32 = Particles::check_distance(
          points[_i as usize].x,
          points[_i as usize].y,
          points[_i as usize].z,
          points[target_index as usize].x,
          points[target_index as usize].y,
          points[target_index as usize].z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness };
        constraints.push(constraint);
      }

      if column < grid_size as u32 && row >= 1 {
        let target_index = (_i as f32 - grid_size + 1.0).floor();

        let distance: f32 = Particles::check_distance(
          points[_i as usize].x,
          points[_i as usize].y,
          points[_i as usize].z,
          points[target_index as usize].x,
          points[target_index as usize].y,
          points[target_index as usize].z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness };
        constraints.push(constraint);
      }
    }

    Particles { points, vertices, constraints, count: particle_count, width, height, depth }
  }

  pub fn update(&mut self, time: f32) {
    // log_u32(self.constraints.len() as u32);

    for i in 0..(self.count as usize) {
      let count = self.count as f32;

      // if i == (count / 2.0 + count.sqrt() / 2.0) as usize {
      //   self.points[i].x = (((time / 5.0).sin() + 1.0) / 2.0) * self.width * 20. - self.width * 10.0;
      //   self.points[i].y = (((time / 6.0).cos() + 1.0) / 2.0) * self.height * 20. - self.height * 10.0;
      //   self.points[i].z = ((((time - 3.) / 8.0).cos() + 1.0) / 2.0) * self.depth * 20. - self.depth * 10.0;
      // }

      if i > (count - count.sqrt()) as usize {
        self.points[i].x += (time * 3.0).sin() * 30.0;
        self.points[i].y = (time / 3.0).cos() * -4.0 + self.height;
        self.points[i].z = ((time - 3. - (i as f32 / (count / 10.0))) * 2.0).sin() * self.depth / 2. + self.depth / 2.0;
      } else {
        self.points[i].y -= 2. - js_sys::Math::random() as f32 * 1.0;
      }


      self.vertices[i * 3] = self.points[i].x;
      self.vertices[i * 3 + 1] = self.points[i].y;
      self.vertices[i * 3 + 2] = self.points[i].z;
    }

    for i in 0..self.constraints.len() {
      self.solve_constraint(self.constraints[i]);
    }
  }

  pub fn check_distance(x1: f32, y1: f32, z1: f32, x2: f32, y2: f32, z2: f32) -> f32 {
    let x = x1 - x2;
    let y = y1 - y2;
    let z = z1 - z2;

    return f32::sqrt((x * x) + (y * y) + (z * z));
  }

  pub fn items(&self) -> *const f32 {
    return self.vertices.as_ptr();
  }


  pub fn solve_constraint (&mut self, constraint: Constraint) {
    let point_a = self.points[constraint.points[0]];
    let point_b = self.points[constraint.points[1]];

    let distance: f32 = Particles::check_distance(point_a.x, point_a.y, point_a.z, point_b.x, point_b.y, point_b.z);

    let diff_x: f32 = point_a.x - point_b.x;
    let diff_y: f32 = point_a.y - point_b.y;
    let diff_z: f32 = point_a.z - point_b.z;

    let difference: f32 = (constraint.resting_distance - distance) / (distance + 0.00001);

    let translate_x: f32 = diff_x * constraint.stiffness * difference;
    let translate_y: f32 = diff_y * constraint.stiffness * difference;
    let translate_z: f32 = diff_z * constraint.stiffness * difference;

    let mass_a = self.points[constraint.points[0]].mass;
    let mass_b = self.points[constraint.points[1]].mass;

    if mass_a > 0.0 {
      self.points[constraint.points[0]].x += translate_x * (2.0 / mass_a);
      self.points[constraint.points[0]].y += translate_y * (2.0 / mass_a);
      self.points[constraint.points[0]].z += translate_z * (2.0 / mass_a);
    }

    if mass_b > 0.0 {
      self.points[constraint.points[1]].x -= translate_x * (2.0 / mass_b);
      self.points[constraint.points[1]].y -= translate_y * (2.0 / mass_b);
      self.points[constraint.points[1]].z -= translate_z * (2.0 / mass_b);
    }
  }
}
