interface AlertProps {
    type: 'error' | 'success';
    message: string;
}

export const Alert = ({ type, message }: AlertProps) => {
    const styles = {
        error: 'bg-red-50 text-red-900 border-red-200',
        success: 'bg-green-50 text-green-900 border-green-200',
    };

    return (
        <div className={`rounded-lg border p-4 text-sm ${styles[type]}`}>
            {message}
        </div>
    );
};
