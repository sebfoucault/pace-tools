# Performance index and race time estimate


A theory defines a performance index PI as that:
- Can be calculated from the time spent to run a given distance
- Can be used to infer the time to run other distances

Let define:
- Velocity v = d / t in m/min

The performance index is defined as:
- pi = i / imax
where
- i = -4.60 + 0.182258 * v + 0.000104 * v^2
- imax = 0.8 + 0.1894393 * exp( -0.012778 * t ) + 0.2989558 * exp( -0.1932605 * t )

## Race time estimate

To estimate the time required to run a given distance based on a known performance index (PI), the following process is used:

1. **Initial assumptions**:
   Start with an initial guess for the time, based on the distance and a reasonable velocity.

2. **Iterative refinement**:
   The time is adjusted iteratively to ensure that the calculated performance index matches the given PI. For each iteration:
   - The velocity `v` is calculated as the distance divided by the current time.
   - The intensity `i` is calculated using the formula:
     `i = -4.60 + 0.182258 * v + 0.000104 * v^2`
   - The maximum intensity `imax` is calculated using the formula:
     `imax = 0.8 + 0.1894393 * exp(-0.012778 * t) + 0.2989558 * exp(-0.1932605 * t)`
   - The performance index is then calculated as:
     `pi = i / imax`

3. **Convergence**:
   The time is adjusted until the calculated performance index is sufficiently close to the given PI. If the calculated PI is too high, the time is increased. If the calculated PI is too low, the time is decreased. This process continues until the difference between the calculated PI and the given PI is negligible.

4. **Result**:
   Once the process converges, the estimated time is returned as the time required to run the given distance at the specified performance index.

# Training pace

v = (-0.182258 + sqrt(0.182258^2 - (4 * 0.000104) * (-4.60 - (pi*pct)))) / (2*0.000104)

where pct is:
- For easy pace: [0.59 - 0.74]
- For marathon pace: [0.75 - 0.84]
- For threshold pace: [0.83 - 0.88]
- For interval pace: [0.95 - 1.00]
- For repetition pace: [1.00 - 1.20]
