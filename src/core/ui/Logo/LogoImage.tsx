const LogoImage: React.FCC<{
  className?: string;
}> = ({ className }) => {
  return <img className={className} src="/assets/images/minimal-logo.svg" />;
};

export default LogoImage;
