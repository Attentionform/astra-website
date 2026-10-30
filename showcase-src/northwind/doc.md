# Adaptive Cooling for Dense Compute

## Abstract

We describe a closed-loop cooling controller that adjusts coolant flow to measured heat load, and show that it reduces pump energy without raising peak temperature.[^1]

## 1. Model

Heat removed by the loop follows the standard relation between mass flow and temperature rise:

$$\dot{Q} = \dot{m}\, c_p \left(T_{out} - T_{c}\right)$$

Here \(\dot{m}\) is the coolant mass flow, \(c_p\) its specific heat, and \(T_{c}\) and \(T_{out}\) the inlet and outlet temperatures. The controller solves for the flow that holds the outlet at its set point \(T_{set}\):

$$\dot{m}_{s} = \frac{\dot{Q}}{c_p \left(T_{set} - T_{c}\right)}$$

## 2. Results

| Load profile | Fixed flow (kW) | Adaptive (kW) | Peak outlet (°C) |
| --- | --- | --- | --- |
| Steady | 4.2 | 3.1 | 42 |
| Bursty | 4.2 | 2.6 | 44 |
| Idle-heavy | 4.2 | 1.4 | 38 |

![Pump power through a load cycle](charts/power.json)

![Outlet temperature against load](charts/scatter.json)

> [!NOTE]
> Peak temperature stayed within the target band in every profile.

## 3. Controller

The control law is a clamped proportional step on the outlet error.

```
flow = clamp(flow + k * (T_out - T_set), f_min, f_max)
```

With gain \(k\) and flow limits \(f_{min}\) and \(f_{max}\), each step is:

$$f_{n+1} = \min\left(f_{max},\ \max\left(f_{min},\ f_n + k\,(T_{out} - T_{set})\right)\right)$$

## 4. Conclusion

Matching flow to load saves pump energy at no thermal cost across the profiles tested.

---

[^1]: Data is synthetic and for demonstration only.
