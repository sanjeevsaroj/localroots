export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
