import type { SVGProps } from 'react'

type Button3DIconProps = SVGProps<SVGSVGElement> & {
  fillClassName?: string
  strokeClassName?: string
}

function Button3DIcon({
  fillClassName = '',
  strokeClassName = '',
  className = '',
  ...props
}: Button3DIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 333 85"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1.25 83.25V9.85855L21.2683 1.25H331.25V77.5855L321.73 83.25H1.25Z"
        className={fillClassName}
      />
      <path
        d="M331.25 1.25V77.5855L321.73 83.25H1.25V9.85855L21.2683 1.25H331.25ZM1.25 9.85855C1.25 9.85855 216.431 9.85855 321.73 9.85855M321.73 83.25C321.73 83.25 321.73 39.3007 321.73 9.85855M321.73 9.85855C325.448 7.27775 331.25 1.25 331.25 1.25"
        className={strokeClassName}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Button3DIcon
