import {css} from "@emotion/react";

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
    children: React.ReactNode;
}

const Button = ({children, ...props}: ButtonProps) => {
    return (
        <button css={S.Button} {...props}>
            {children}
        </button>
    );
};

const S = {
    Button: css`
        user-select: none;
    `
}

export default Button;