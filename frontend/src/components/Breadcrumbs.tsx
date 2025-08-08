import { Link, useMatches, useLocation } from "@tanstack/react-router"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Breadcrumbs({overrideString}: {overrideString?: string}) {
    // const location = useLocation();
    // console.log('location:', location);
    const override: string = overrideString || "";

    function capitalizeFirstLetter(str: string): string {
        if (str.length === 0) {
            return ""; // Handle empty strings
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const current = useLocation();

    const route_history = current.pathname
        .split("/")
        .filter((x) => x && x.length > 0);

    const breadcrumb_routes = route_history.reduce(
        (acc: { name: string; path: string }[], route) => {
            const prev_path = acc[acc.length - 1]?.path ?? "";
            acc.push({ name: capitalizeFirstLetter(route), path: `${prev_path}/${route}` });

            return acc;
        },
    [],);
    console.log('breadcrumb_routes:', breadcrumb_routes);


    return (
        <Breadcrumb className="mb-5 animate-appear">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumb_routes.length > 0 && 
                    breadcrumb_routes.map((route, index) => (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem key={index}>
                                {index + 1 === breadcrumb_routes.length ? (
                                    <BreadcrumbPage className={`${index + 1 === breadcrumb_routes.length && 'text-brand'}`}>
                                        {override ? override : route.name}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={route.path}>{route.name}</Link>
                                    </BreadcrumbLink>
                                )}
                                
                            </BreadcrumbItem>
                        </>
                    )
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
