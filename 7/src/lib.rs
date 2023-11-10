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
  initial_x: f32,
  initial_y: f32,
  initial_z: f32,
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
      let mut mass = 0.8;
      // let mut mass = 1.7 - ((_i / (particle_count * 100000)) as f32) / grid_size;

      let mut row = (_i as f32 / grid_size);
      let column = _i as f32 % grid_size;

      if row > grid_size - 1.  || row < 2. || column < 1. || column > grid_size - 4. {
        mass = 0.0;
      }

      let point = Point {
        x: ((width / grid_size) + 2.) * (column - 1.),
        y: ((height / grid_size) + 2.) * (row - 1.),
        z: depth / 2.0,
        initial_x: ((width / grid_size) + 2.) * (column - 1.),
        initial_y: ((height / grid_size) + 2.) * (row - 1.),
        initial_z: depth / 2.0,
        index: _i as i32,
        mass: mass
      };

      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      points.push(point);
    }

    let mut stiffness = 0.47;

    for _i in 0..particle_count {
      let row = (_i as f32 / grid_size).floor() as u32;
      let column = _i % grid_size as u32;

      // stiffness += ((js_sys::Math::random() as f32) - 0.5) / 100.;

      if column >= 1 {
        let target_index = _i - 1;

        let distance: f32 = Particles::check_distance(
          points[target_index as usize].initial_x,
          points[target_index as usize].initial_y,
          points[target_index as usize].initial_z,
          points[_i as usize].initial_x,
          points[_i as usize].initial_y,
          points[_i as usize].initial_z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness: stiffness };
        constraints.push(constraint);
      }

      if row >= 1 {
        let target_index = (_i as f32 - grid_size).floor();

        let distance: f32 = Particles::check_distance(
          points[target_index as usize].initial_x,
          points[target_index as usize].initial_y,
          points[target_index as usize].initial_z,
          points[_i as usize].initial_x,
          points[_i as usize].initial_y,
          points[_i as usize].initial_z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness: stiffness * 1.8 };
        constraints.push(constraint);
      }

      if column >= 1 && row >= 1 {
        let target_index = (_i as f32 - grid_size - 1.0).floor();

        let distance: f32 = Particles::check_distance(
          points[_i as usize].initial_x,
          points[_i as usize].initial_y,
          points[_i as usize].initial_z,
          points[target_index as usize].initial_x,
          points[target_index as usize].initial_y,
          points[target_index as usize].initial_z
        );

        let mut _points = [_i as usize, target_index as usize];

        let constraint = Constraint { points: _points, resting_distance: distance, stiffness };
        constraints.push(constraint);
      }

      // if column < grid_size as u32 && row >= 1 {
      //   let target_index = (_i as f32 - grid_size + 1.0).floor();

      //   let distance: f32 = Particles::check_distance(
      //     points[_i as usize].x,
      //     points[_i as usize].y,
      //     points[_i as usize].z,
      //     points[target_index as usize].x,
      //     points[target_index as usize].y,
      //     points[target_index as usize].z
      //   );

      //   let mut _points = [_i as usize, target_index as usize];

      //   let constraint = Constraint { points: _points, resting_distance: distance, stiffness };
      //   constraints.push(constraint);
      // }
    }

    Particles { points, vertices, constraints, count: particle_count, width, height, depth }
  }

  pub fn update(&mut self, mousepos_x: f32, mousepos_y: f32) {
    // log_u32(self.constraints.len() as u32);

    for i in 0..(self.count as usize) {
      let count = self.count as f32;

      let distance_from_mouse: f32 = Particles::check_distance(
        self.points[i as usize].x,
        self.points[i as usize].y,
        0.0,
        mousepos_x * self.width,
        mousepos_y * self.height,
        0.0
      );

      if self.points[i].mass > 0.0 {
        // if i > (count - count.sqrt()) as usize {
        if (distance_from_mouse < 100.0) {
          // let x_target = self.points[i].initial_x - (30. - distance_from_mouse) / 100.;
          // let y_target = self.points[i].initial_y - (30. - distance_from_mouse) / 2.;
          let z_target = self.points[i].z  + (self.points[i].initial_z - ((110. - distance_from_mouse) * (110. - distance_from_mouse)));

          // self.points[i].x = self.points[i].initial_x + 0.1 * (x_target - self.points[i].initial_x);
          // self.points[i].y = self.points[i].initial_y + 0.1 * (y_target - self.points[i].initial_y);
          self.points[i].z = self.points[i].z + 0.01 * (z_target - self.points[i].initial_z);
        } else {
          // LERP BACK TO START
          self.points[i].x = self.points[i].x + 0.05 * (self.points[i].initial_x - self.points[i].x);
          self.points[i].y = self.points[i].y + 0.05 * (self.points[i].initial_y - self.points[i].y);
          self.points[i].z = self.points[i].z + 0.1 * (self.points[i].initial_z - self.points[i].z);
        }

        self.vertices[i * 3] = self.points[i].x;
        self.vertices[i * 3 + 1] = self.points[i].y;
        self.vertices[i * 3 + 2] = self.points[i].z;
      }
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

    if point_a.mass > 0. {
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
        self.points[constraint.points[0]].x += translate_x * (1.0 / mass_a);
        self.points[constraint.points[0]].y += translate_y * (1.0 / mass_a);
        self.points[constraint.points[0]].z += translate_z * (1.0 / mass_a);
      }

      if mass_b > 0.0 {
        self.points[constraint.points[1]].x -= translate_x * (0.9 / mass_b);
        self.points[constraint.points[1]].y -= translate_y * (0.9 / mass_b);
        self.points[constraint.points[1]].z -= translate_z * (0.9 / mass_b);
      }
    }
  }
}
