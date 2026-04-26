import Image from "next/image";

export default function CompanyLogo() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
    }}>
      <Image
        src="/logo.jpeg"
        alt="Company Logo"
        width={48}
        height={48}
        style={{ borderRadius: "10px", objectFit: "contain" }}
      />
    </div>
  );
}
