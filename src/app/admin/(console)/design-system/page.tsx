import {
  Badge,
  Button,
  Card,
  CodeBlock,
  ColorSwatches,
  DataTable,
  EmptyState,
  Field,
  Grid,
  Notice,
  Page,
  Row,
  Select,
  Stack,
  Text,
} from "@/components/ui";
import { requireSuperuser } from "@/lib/auth";
export default async function DesignSystemPage() {
  await requireSuperuser();
  return (
    <Page
      title="Design system"
      description="One visual language. Every page, every interaction."
      actions={<Badge tone="accent">Vox foundations</Badge>}
    >
      <Grid columns={2}>
        <Card
          title="Color"
          description="Quiet surfaces, clear contrast, and a little warmth."
        >
          <ColorSwatches />
        </Card>
        <Card
          title="Typography"
          description="Manrope. A shared scale for every screen."
        >
          <Stack gap="small">
            <h2>A little more clarity.</h2>
            <h3>The details belong together.</h3>
            <Text muted>Readable, restrained, and comfortable.</Text>
          </Stack>
        </Card>
      </Grid>
      <Card
        title="Actions"
        description="Primary actions lead. Secondary actions support. These are disabled specimens."
      >
        <Row>
          <Button disabled>Primary action</Button>
          <Button variant="secondary" disabled>
            Secondary action
          </Button>
          <Button variant="ghost" disabled>
            Quiet action
          </Button>
          <Badge tone="positive">Connected</Badge>
          <Badge tone="warning">Attention</Badge>
        </Row>
      </Card>
      <Grid columns={2}>
        <Card title="Forms">
          <Stack>
            <Field
              id="example-name"
              label="Workspace name"
              name="workspace"
              defaultValue="Vox"
              hint="A visible label and helpful context."
            />
            <Select id="example-view" name="view" label="Default view">
              <option>Overview</option>
              <option>Redis explorer</option>
            </Select>
          </Stack>
        </Card>
        <Card title="Feedback">
          <Stack>
            <Notice title="Information stays close to the action">
              Keep messages specific and useful.
            </Notice>
            <Notice title="A change needs your attention" tone="error">
              Explain what happened and how to recover.
            </Notice>
          </Stack>
        </Card>
      </Grid>
      <Card title="Tables">
        <DataTable
          caption="Design system example table"
          headings={["Component", "Purpose", "Status"]}
        >
          <tr>
            <td>Page</td>
            <td>Consistent titles and content spacing</td>
            <td>
              <Badge tone="positive">Available</Badge>
            </td>
          </tr>
          <tr>
            <td>Card</td>
            <td>Related information and controls</td>
            <td>
              <Badge tone="positive">Available</Badge>
            </td>
          </tr>
        </DataTable>
      </Card>
      <Card title="Empty states">
        <EmptyState
          title="Nothing to show yet"
          description="Explain what will appear here and the next useful action."
        />
      </Card>
      <Card
        title="Build another page"
        description="Use the page generator or compose the same primitives. No custom styles needed."
      >
        <Stack>
          <CodeBlock>
            {'npm run generate:page -- schedules "Schedules"'}
          </CodeBlock>
          <CodeBlock>{`<Page title="Schedules" description="Manage upcoming activity.">\n  <Card title="Upcoming">\n    <EmptyState\n      title="No schedules yet"\n      description="Your scheduled activity will appear here."\n    />\n  </Card>\n</Page>`}</CodeBlock>
          <Text muted small>
            The shared console layout supplies navigation and authentication.
            New data routes must also authorize each request.
          </Text>
        </Stack>
      </Card>
    </Page>
  );
}
