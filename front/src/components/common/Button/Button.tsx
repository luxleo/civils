import {css} from "@emotion/react";

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
    mode?: "none" | "primary" | "secondary";
    children: React.ReactNode;
}

const Button = ({children, mode, ...props}: ButtonProps) => {
    return (
        <button css={S.Button} {...props} className={mode}>
            {children}
        </button>
    );
};

const S = {
    Button: css`
        user-select: none;

        &.primary {
            background-color: #4a90e2;
        }

        &.secondary {
            background-color: #f5f5f5;
        }
    `
}

export default Button;