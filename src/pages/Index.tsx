import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <h1 className="text-4xl font-bold mb-3">Your Store</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The storefront isn't built yet. Use the admin section to add products and categories.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link to="/admin">Open Admin</Link></Button>
        <Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button>
      </div>
    </div>
  );
};

export default Index;
